import type { StudentSession } from '../types/auth.ts';
import type { StudentGameState } from '../types/game.ts';
import { createDefaultStudentGameState } from '../data/townData.ts';

function getLocalStorageKey(session: StudentSession): string {
  return `ddw_student_state_${session.classCode}_${session.studentCode}`;
}

export function loadLocalCachedState(session: StudentSession): StudentGameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(getLocalStorageKey(session));
    if (!raw) return null;
    return JSON.parse(raw) as StudentGameState;
  } catch {
    return null;
  }
}

export function saveLocalCachedState(
  session: StudentSession,
  state: StudentGameState,
  pendingSync: boolean
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      getLocalStorageKey(session),
      JSON.stringify({ ...state, _pendingSync: pendingSync })
    );
  } catch {
    // Ignore storage quota issues
  }
}

export function buildInitialStudentStateFromSession(session: StudentSession): StudentGameState {
  const defaults = createDefaultStudentGameState();
  const p = session.progress;

  const serverState: StudentGameState = {
    detectiveNickname: p.detectiveNickname || '',
    avatarConfig: p.avatarConfig ?? null,
    tutorialProgress: p.tutorialProgress ?? defaults.tutorialProgress,
    settings: p.settings ?? defaults.settings,
    inventory: p.inventory ?? defaults.inventory,
    xp: p.xp ?? 0,
    stars: p.stars ?? 0,
    level: Math.max(1, Math.floor((p.xp ?? 0) / 100) + 1),
    currentMission: defaults.currentMission,
    completedMissions: p.completedMissions ?? [],
    unlockedBuildings: p.unlockedBuildings ?? ['detective-hq'],
    lastPosition: p.townPosition ?? defaults.lastPosition,
    lastScene: p.avatarConfig
      ? p.lastPosition === 'screen-03-handoff'
        ? 'screen-03-handoff'
        : 'town'
      : 'customisation',
    updatedAt: p.updatedAt ?? 0,
  };

  // Merge newer offline-cached progress only if it is genuinely newer than server state
  const local = loadLocalCachedState(session);
  if (local && local.updatedAt > serverState.updatedAt && local.avatarConfig) {
    return local;
  }

  return serverState;
}

export async function fetchStudentStateFromServer(): Promise<{
  ok: boolean;
  state?: StudentGameState;
}> {
  try {
    const res = await fetch('/api/student/state', {
      method: 'GET',
      credentials: 'same-origin',
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { ok?: boolean; state?: StudentGameState };
    if (data.ok && data.state) {
      return { ok: true, state: data.state };
    }
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

export async function saveStudentStateToServer(
  session: StudentSession,
  state: StudentGameState
): Promise<{ ok: boolean; offline: boolean; state: StudentGameState }> {
  const stamped: StudentGameState = {
    ...state,
    updatedAt: Date.now(),
  };

  // Always cache locally immediately
  saveLocalCachedState(session, stamped, true);

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: false, offline: true, state: stamped };
  }

  try {
    const res = await fetch('/api/student/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ state: stamped }),
    });

    if (!res.ok) {
      return { ok: false, offline: res.status >= 500 || res.status === 0, state: stamped };
    }

    const data = (await res.json()) as { ok?: boolean; state?: StudentGameState };
    const confirmed = data.state ?? stamped;
    saveLocalCachedState(session, confirmed, false);
    return { ok: true, offline: false, state: confirmed };
  } catch {
    return { ok: false, offline: true, state: stamped };
  }
}
