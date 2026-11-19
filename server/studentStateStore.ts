import fs from 'node:fs';
import path from 'node:path';
import express, { type Request, type Response } from 'express';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { StudentGameState } from '../src/types/game.ts';
import { createDefaultStudentGameState } from '../src/data/townData.ts';
import { parseSessionFromRequest, signAndSetSessionCookie } from './authService.ts';

const PREVIEW_STORE_PATH = path.resolve(process.cwd(), '.ddw-preview-students.json');
const memoryPreviewStore = new Map<string, StudentGameState>();

function loadPreviewStoreFromDisk(): void {
  if (memoryPreviewStore.size > 0) return;
  try {
    if (fs.existsSync(PREVIEW_STORE_PATH)) {
      const raw = fs.readFileSync(PREVIEW_STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as Record<string, StudentGameState>;
      for (const [k, v] of Object.entries(parsed)) {
        memoryPreviewStore.set(k, v);
      }
    }
  } catch {
    // Ignore disk read errors in read-only serverless runtimes
  }
}

function flushPreviewStoreToDisk(): void {
  try {
    const obj: Record<string, StudentGameState> = {};
    for (const [k, v] of memoryPreviewStore.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(PREVIEW_STORE_PATH, JSON.stringify(obj, null, 2), 'utf8');
  } catch {
    // Fallback gracefully to in-memory storage if filesystem is read-only
  }
}

export function getPreviewStudentKey(classCode: string, studentCode: string): string {
  return `${classCode.trim().toUpperCase()}::${studentCode.trim().toUpperCase()}`;
}

export function getPreviewStudentState(
  classCode: string,
  studentCode: string
): StudentGameState | null {
  loadPreviewStoreFromDisk();
  return memoryPreviewStore.get(getPreviewStudentKey(classCode, studentCode)) ?? null;
}

export function savePreviewStudentState(
  classCode: string,
  studentCode: string,
  state: StudentGameState
): StudentGameState {
  loadPreviewStoreFromDisk();
  const key = getPreviewStudentKey(classCode, studentCode);
  const existing = memoryPreviewStore.get(key);

  // Prevent older client payloads from overwriting newer saved progress
  if (existing && existing.updatedAt > state.updatedAt) {
    return existing;
  }

  const nextState: StudentGameState = {
    ...state,
    updatedAt: Date.now(),
  };
  memoryPreviewStore.set(key, nextState);
  flushPreviewStoreToDisk();
  return nextState;
}

function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    return null;
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function createStudentRouter(): express.Router {
  const router = express.Router();
  router.use(express.json({ limit: '64kb' }));

  router.get('/state', async (req: Request, res: Response) => {
    const session = parseSessionFromRequest(req);
    if (!session || session.role !== 'student') {
      res.status(401).json({ ok: false, message: 'Student session required.' });
      return;
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      const saved =
        getPreviewStudentState(session.classCode, session.studentCode) ??
        createDefaultStudentGameState();
      res.json({
        ok: true,
        source: 'preview',
        state: saved,
      });
      return;
    }

    try {
      const { data: row, error } = await supabase
        .from('students')
        .select(
          'detective_nickname, avatar_config, tutorial_progress, settings, inventory, xp, stars, completed_missions, unlocked_buildings, town_position, last_position, updated_at'
        )
        .eq('id', session.id)
        .maybeSingle();

      if (error || !row) {
        res.status(404).json({ ok: false, message: 'Student profile not found.' });
        return;
      }

      const defaults = createDefaultStudentGameState();
      const state: StudentGameState = {
        detectiveNickname: String(row.detective_nickname ?? ''),
        avatarConfig: row.avatar_config ?? null,
        tutorialProgress: row.tutorial_progress ?? defaults.tutorialProgress,
        settings: row.settings ?? defaults.settings,
        inventory: row.inventory ?? defaults.inventory,
        xp: Number(row.xp ?? 0),
        stars: Number(row.stars ?? 0),
        level: Math.max(1, Math.floor(Number(row.xp ?? 0) / 100) + 1),
        currentMission: defaults.currentMission,
        completedMissions: Array.isArray(row.completed_missions)
          ? row.completed_missions.map(String)
          : [],
        unlockedBuildings: Array.isArray(row.unlocked_buildings)
          ? row.unlocked_buildings
          : ['detective-hq'],
        lastPosition: row.town_position ?? defaults.lastPosition,
        lastScene:
          row.last_position === 'screen-03' || row.last_position === 'screen-03-handoff'
            ? 'screen-03-handoff'
            : row.avatar_config
              ? 'town'
              : 'customisation',
        updatedAt: row.updated_at ? new Date(String(row.updated_at)).getTime() : Date.now(),
      };

      res.json({ ok: true, source: 'cloud', state });
    } catch {
      res.status(500).json({ ok: false, message: 'Could not load student progress.' });
    }
  });

  router.put('/state', async (req: Request, res: Response) => {
    const session = parseSessionFromRequest(req);
    if (!session || session.role !== 'student') {
      res.status(401).json({ ok: false, message: 'Student session required.' });
      return;
    }

    const incoming = req.body?.state as StudentGameState | undefined;
    if (!incoming || typeof incoming !== 'object') {
      res.status(400).json({ ok: false, message: 'Invalid student state payload.' });
      return;
    }

    // Sanitize nickname (never accept overly long strings)
    const cleanNickname = String(incoming.detectiveNickname ?? '').trim().slice(0, 24);
    const sanitizedState: StudentGameState = {
      ...incoming,
      detectiveNickname: cleanNickname,
      updatedAt: Number(incoming.updatedAt || Date.now()),
    };

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      const saved = savePreviewStudentState(session.classCode, session.studentCode, sanitizedState);

      // Update signed cookie session progress so browser refresh stays in sync
      const updatedSession = {
        ...session,
        isFirstTime: !saved.avatarConfig,
        progress: {
          ...session.progress,
          hasAvatar: Boolean(saved.avatarConfig),
          detectiveNickname: saved.detectiveNickname,
          avatarConfig: saved.avatarConfig,
          xp: saved.xp,
          stars: saved.stars,
          completedMissions: saved.completedMissions,
          tutorialProgress: saved.tutorialProgress,
          settings: saved.settings,
          inventory: saved.inventory,
          unlockedBuildings: saved.unlockedBuildings,
          townPosition: saved.lastPosition,
          lastPosition: saved.lastScene,
          updatedAt: saved.updatedAt,
        },
      };
      signAndSetSessionCookie(res, req, updatedSession);

      res.json({
        ok: true,
        source: 'preview',
        state: saved,
      });
      return;
    }

    try {
      const { data: existingRow } = await supabase
        .from('students')
        .select('updated_at')
        .eq('id', session.id)
        .maybeSingle();

      const serverUpdatedAt = existingRow?.updated_at
        ? new Date(String(existingRow.updated_at)).getTime()
        : 0;

      // Avoid overwriting newer server data with older local data
      if (serverUpdatedAt > sanitizedState.updatedAt + 1000) {
        res.status(409).json({
          ok: false,
          code: 'STALE_LOCAL_DATA',
          message: 'Newer progress exists on the server.',
        });
        return;
      }

      const nowIso = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('students')
        .update({
          detective_nickname: sanitizedState.detectiveNickname,
          avatar_config: sanitizedState.avatarConfig,
          tutorial_progress: sanitizedState.tutorialProgress,
          settings: sanitizedState.settings,
          inventory: sanitizedState.inventory,
          unlocked_buildings: sanitizedState.unlockedBuildings,
          town_position: sanitizedState.lastPosition,
          last_position: sanitizedState.lastScene,
          updated_at: nowIso,
        })
        .eq('id', session.id);

      if (updateError) {
        res.status(500).json({ ok: false, message: 'Could not save progress to cloud.' });
        return;
      }

      const savedState: StudentGameState = {
        ...sanitizedState,
        updatedAt: new Date(nowIso).getTime(),
      };

      const updatedSession = {
        ...session,
        isFirstTime: !savedState.avatarConfig,
        progress: {
          ...session.progress,
          hasAvatar: Boolean(savedState.avatarConfig),
          detectiveNickname: savedState.detectiveNickname,
          avatarConfig: savedState.avatarConfig,
          tutorialProgress: savedState.tutorialProgress,
          settings: savedState.settings,
          inventory: savedState.inventory,
          unlockedBuildings: savedState.unlockedBuildings,
          townPosition: savedState.lastPosition,
          lastPosition: savedState.lastScene,
          updatedAt: savedState.updatedAt,
        },
      };
      signAndSetSessionCookie(res, req, updatedSession);

      res.json({
        ok: true,
        source: 'cloud',
        state: savedState,
      });
    } catch {
      res.status(500).json({ ok: false, message: 'Could not save progress.' });
    }
  });

  return router;
}
