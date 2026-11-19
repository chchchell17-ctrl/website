import crypto from 'node:crypto';
import express, { type Request, type Response } from 'express';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AuthenticatedSession,
  BackendStatus,
  LinkedChildSummary,
  ParentSession,
  PortalType,
  StudentSession,
  TeacherSession,
} from '../src/types/auth.ts';
import type { AvatarConfig } from '../src/types/game.ts';
import { getPreviewStudentState } from './studentStateStore.ts';

const SESSION_COOKIE_NAME = 'ddw_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours
const RATE_LIMIT_WINDOW_MS = 1000 * 60 * 5; // 5 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_LOCK_MS = 1000 * 60; // 60 seconds cooldown

interface RateLimitEntry {
  attempts: number[];
  lockedUntil: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry) {
    return { allowed: true };
  }
  if (entry.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.lockedUntil - now) / 1000)),
    };
  }
  entry.attempts = entry.attempts.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (entry.attempts.length === 0) {
    rateLimitStore.delete(key);
  }
  return { allowed: true };
}

function recordFailedAttempt(key: string): { locked: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key) ?? { attempts: [], lockedUntil: 0 };
  entry.attempts = entry.attempts.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  entry.attempts.push(now);
  if (entry.attempts.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    entry.lockedUntil = now + RATE_LIMIT_LOCK_MS;
    rateLimitStore.set(key, entry);
    return { locked: true, retryAfterSeconds: Math.ceil(RATE_LIMIT_LOCK_MS / 1000) };
  }
  rateLimitStore.set(key, entry);
  return { locked: false };
}

function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

export function getBackendStatus(): BackendStatus {
  const missingEnv: string[] = [];
  if (!process.env.SUPABASE_URL?.trim()) {
    missingEnv.push('SUPABASE_URL');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    missingEnv.push('SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!process.env.AUTH_SESSION_SECRET?.trim()) {
    missingEnv.push('AUTH_SESSION_SECRET');
  }
  return {
    configured: missingEnv.length === 0,
    missingEnv,
  };
}

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    return null;
  }
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getSupabasePublicAuthClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim();
  const anonKey =
    process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !anonKey) {
    return null;
  }
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function hashStudentPin(pin: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(pin, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyStudentPin(pin: string, storedHash: string): boolean {
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }
  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) {
    return false;
  }
  try {
    const derived = crypto.scryptSync(pin, salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    if (derived.length !== expected.length) {
      return false;
    }
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

interface SignedSessionPayload {
  session: AuthenticatedSession;
  exp: number;
}

const EPHEMERAL_RUNTIME_SECRET = crypto.randomBytes(32).toString('hex');

function getSessionSecret(allowRuntimeFallback: boolean): string | null {
  const configuredSecret = process.env.AUTH_SESSION_SECRET?.trim();
  if (configuredSecret) {
    return configuredSecret;
  }
  return allowRuntimeFallback ? EPHEMERAL_RUNTIME_SECRET : null;
}

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

function signSession(session: AuthenticatedSession): string | null {
  const secret = getSessionSecret(!isSupabaseConfigured());
  if (!secret) {
    return null;
  }
  const payload: SignedSessionPayload = {
    session,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySessionCookie(token: string | undefined): AuthenticatedSession | null {
  const secret = getSessionSecret(!isSupabaseConfigured());
  if (!secret || !token) {
    return null;
  }
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) {
    return null;
  }
  const expectedSig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SignedSessionPayload;
    if (!parsed.exp || Date.now() > parsed.exp || !parsed.session) {
      return null;
    }
    return parsed.session;
  } catch {
    return null;
  }
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) {
    return {};
  }
  const cookies: Record<string, string> = {};
  for (const pair of header.split(';')) {
    const eqIndex = pair.indexOf('=');
    if (eqIndex > 0) {
      const key = pair.slice(0, eqIndex).trim();
      const value = pair.slice(eqIndex + 1).trim();
      cookies[key] = decodeURIComponent(value);
    }
  }
  return cookies;
}

function setSessionCookie(res: Response, req: Request, token: string): void {
  const isHttps =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    process.env.NODE_ENV === 'production';

  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    isHttps ? 'SameSite=None' : 'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (isHttps) {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(res: Response, req: Request): void {
  const isHttps =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    process.env.NODE_ENV === 'production';

  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    isHttps ? 'SameSite=None' : 'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isHttps) {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function parseSessionFromRequest(req: Request): AuthenticatedSession | null {
  const cookies = parseCookies(req);
  return verifySessionCookie(cookies[SESSION_COOKIE_NAME]);
}

export function signAndSetSessionCookie(
  res: Response,
  req: Request,
  session: AuthenticatedSession
): boolean {
  const token = signSession(session);
  if (!token) return false;
  setSessionCookie(res, req, token);
  return true;
}

export function createAuthRouter(): express.Router {
  const router = express.Router();
  router.use(express.json({ limit: '16kb' }));

  router.get('/status', (_req: Request, res: Response) => {
    const status = getBackendStatus();
    res.json({
      ok: true,
      ...status,
    });
  });

  router.get('/session', (req: Request, res: Response) => {
    const cookies = parseCookies(req);
    const session = verifySessionCookie(cookies[SESSION_COOKIE_NAME]);
    res.json({
      ok: true,
      session,
    });
  });

  router.post('/logout', (req: Request, res: Response) => {
    clearSessionCookie(res, req);
    res.json({ ok: true });
  });

  router.post('/student-login', async (req: Request, res: Response) => {
    const classCode = typeof req.body?.classCode === 'string' ? req.body.classCode.trim().toUpperCase() : '';
    const studentId = typeof req.body?.studentId === 'string' ? req.body.studentId.trim().toUpperCase() : '';
    const pin = typeof req.body?.pin === 'string' ? req.body.pin.trim() : '';

    if (!classCode || !studentId || !pin) {
      res.status(400).json({
        ok: false,
        code: 'EMPTY_FIELDS',
        message: 'Oops! Please complete your login details.',
      });
      return;
    }

    const clientIp = getClientIp(req);
    const ipLimitKey = `${clientIp}:student`;
    const accountLimitKey = `${clientIp}:student:${classCode}:${studentId}`;

    const ipCheck = checkRateLimit(ipLimitKey);
    const accountCheck = checkRateLimit(accountLimitKey);
    if (!ipCheck.allowed || !accountCheck.allowed) {
      res.status(429).json({
        ok: false,
        code: 'RATE_LIMITED',
        message: 'Please wait a moment before trying again.',
        retryAfterSeconds: accountCheck.retryAfterSeconds ?? ipCheck.retryAfterSeconds ?? 60,
      });
      return;
    }

    const status = getBackendStatus();
    const supabase = getSupabaseAdmin();
    if (!status.configured || !supabase) {
      // Preview / offline-Supabase access mode: accept any non-empty credentials entered
      // while hashing the PIN in memory and restoring saved preview progress if returning.
      hashStudentPin(pin);
      clearRateLimit(accountLimitKey);

      const savedPreview = getPreviewStudentState(classCode, studentId);
      const hasAvatar = Boolean(savedPreview?.avatarConfig);

      const previewStudentSession: StudentSession = {
        role: 'student',
        id: `preview-${classCode}-${studentId}`,
        studentCode: studentId,
        displayName: savedPreview?.detectiveNickname || `Detective ${studentId}`,
        classCode,
        className: `Class ${classCode}`,
        isFirstTime: !hasAvatar,
        progress: {
          hasAvatar,
          detectiveNickname: savedPreview?.detectiveNickname ?? '',
          avatarConfig: savedPreview?.avatarConfig ?? null,
          xp: savedPreview?.xp ?? 0,
          stars: savedPreview?.stars ?? 0,
          badges: savedPreview?.inventory?.badges?.map((b) => b.name) ?? [],
          completedMissions: savedPreview?.completedMissions ?? [],
          lastPosition: savedPreview?.lastScene ?? (hasAvatar ? 'town' : 'customisation'),
          tutorialProgress: savedPreview?.tutorialProgress,
          settings: savedPreview?.settings,
          inventory: savedPreview?.inventory,
          unlockedBuildings: savedPreview?.unlockedBuildings,
          townPosition: savedPreview?.lastPosition,
          updatedAt: savedPreview?.updatedAt,
        },
      };

      const token = signSession(previewStudentSession);
      if (token) {
        setSessionCookie(res, req, token);
      }
      res.json({
        ok: true,
        message: 'Welcome back, Detective! Your adventure is waiting!',
        session: previewStudentSession,
      });
      return;
    }

    try {
      const { data: classRecord, error: classError } = await supabase
        .from('classes')
        .select('id, class_code, class_name, is_active')
        .eq('class_code', classCode)
        .maybeSingle();

      if (classError || !classRecord || !classRecord.is_active) {
        recordFailedAttempt(ipLimitKey);
        const lockResult = recordFailedAttempt(accountLimitKey);
        if (lockResult.locked) {
          res.status(429).json({
            ok: false,
            code: 'RATE_LIMITED',
            message: 'Please wait a moment before trying again.',
            retryAfterSeconds: lockResult.retryAfterSeconds,
          });
          return;
        }
        res.status(401).json({
          ok: false,
          code: 'INVALID_CREDENTIALS',
          message: "Hmm... That doesn't look right, Detective. Please check your details and try again!",
        });
        return;
      }

      const { data: studentRecord, error: studentError } = await supabase
        .from('students')
        .select(
          'id, student_code, display_name, detective_nickname, pin_hash, is_active, avatar_config, tutorial_progress, settings, inventory, unlocked_buildings, town_position, xp, stars, badges, completed_missions, last_position, updated_at'
        )
        .eq('class_id', classRecord.id)
        .eq('student_code', studentId)
        .maybeSingle();

      if (
        studentError ||
        !studentRecord ||
        !studentRecord.is_active ||
        !verifyStudentPin(pin, String(studentRecord.pin_hash ?? ''))
      ) {
        recordFailedAttempt(ipLimitKey);
        const lockResult = recordFailedAttempt(accountLimitKey);
        if (lockResult.locked) {
          res.status(429).json({
            ok: false,
            code: 'RATE_LIMITED',
            message: 'Please wait a moment before trying again.',
            retryAfterSeconds: lockResult.retryAfterSeconds,
          });
          return;
        }
        res.status(401).json({
          ok: false,
          code: 'INVALID_CREDENTIALS',
          message: "Hmm... That doesn't look right, Detective. Please check your details and try again!",
        });
        return;
      }

      clearRateLimit(accountLimitKey);

      const hasAvatar = Boolean(studentRecord.avatar_config);
      const studentSession: StudentSession = {
        role: 'student',
        id: String(studentRecord.id),
        studentCode: String(studentRecord.student_code),
        displayName: String(studentRecord.detective_nickname || studentRecord.display_name),
        classCode: String(classRecord.class_code),
        className: String(classRecord.class_name),
        isFirstTime: !hasAvatar,
        progress: {
          hasAvatar,
          detectiveNickname: String(studentRecord.detective_nickname ?? ''),
          avatarConfig: (studentRecord.avatar_config as AvatarConfig | null) ?? null,
          xp: Number(studentRecord.xp ?? 0),
          stars: Number(studentRecord.stars ?? 0),
          badges: Array.isArray(studentRecord.badges) ? studentRecord.badges.map(String) : [],
          completedMissions: Array.isArray(studentRecord.completed_missions)
            ? studentRecord.completed_missions.map(String)
            : [],
          lastPosition: String(studentRecord.last_position ?? (hasAvatar ? 'town' : 'customisation')),
          tutorialProgress: studentRecord.tutorial_progress ?? undefined,
          settings: studentRecord.settings ?? undefined,
          inventory: studentRecord.inventory ?? undefined,
          unlockedBuildings: Array.isArray(studentRecord.unlocked_buildings)
            ? studentRecord.unlocked_buildings
            : undefined,
          townPosition: studentRecord.town_position ?? undefined,
          updatedAt: studentRecord.updated_at
            ? new Date(String(studentRecord.updated_at)).getTime()
            : undefined,
        },
      };

      const token = signSession(studentSession);
      if (!token) {
        res.status(503).json({
          ok: false,
          code: 'BACKEND_NOT_CONFIGURED',
          message: "Oops! We couldn't connect. Please ask your teacher to check the school portal setup.",
          missingEnv: ['AUTH_SESSION_SECRET'],
        });
        return;
      }

      setSessionCookie(res, req, token);
      res.json({
        ok: true,
        message: 'Welcome back, Detective! Your adventure is waiting!',
        session: studentSession,
      });
    } catch {
      res.status(500).json({
        ok: false,
        code: 'NETWORK_ERROR',
        message: "Oops! We couldn't connect. Please check your internet connection and try again.",
      });
    }
  });

  router.post('/teacher-login', async (req: Request, res: Response) => {
    const identifier = typeof req.body?.identifier === 'string' ? req.body.identifier.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!identifier || !password) {
      res.status(400).json({
        ok: false,
        code: 'EMPTY_FIELDS',
        message: 'Please enter your registered email or username and password.',
      });
      return;
    }

    const clientIp = getClientIp(req);
    const limitKey = `${clientIp}:teacher:${identifier.toLowerCase()}`;
    const rateCheck = checkRateLimit(limitKey);
    if (!rateCheck.allowed) {
      res.status(429).json({
        ok: false,
        code: 'RATE_LIMITED',
        message: 'Please wait a moment before trying again.',
        retryAfterSeconds: rateCheck.retryAfterSeconds,
      });
      return;
    }

    const status = getBackendStatus();
    const supabaseAdmin = getSupabaseAdmin();
    const supabasePublic = getSupabasePublicAuthClient();
    if (!status.configured || !supabaseAdmin || !supabasePublic) {
      clearRateLimit(limitKey);
      const rawName = identifier.includes('@') ? identifier.split('@')[0] : identifier;
      const formattedName = rawName
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (ch: string) => ch.toUpperCase());

      const previewTeacherSession: TeacherSession = {
        role: 'teacher',
        id: `preview-teacher-${rawName.toLowerCase()}`,
        displayName: formattedName || 'Teacher',
        email: identifier.includes('@') ? identifier : `${identifier}@sjkcmingtao.edu.my`,
        schoolName: 'SJKC Ming Tao',
        assignedClasses: ['5M', '5T'],
      };

      const token = signSession(previewTeacherSession);
      if (token) {
        setSessionCookie(res, req, token);
      }
      res.json({
        ok: true,
        message: 'Welcome back! Redirecting to Teacher Control Centre.',
        session: previewTeacherSession,
      });
      return;
    }

    try {
      let resolvedEmail = identifier;
      if (!identifier.includes('@')) {
        const { data: teacherLookup } = await supabaseAdmin
          .from('teacher_profiles')
          .select('email')
          .eq('username', identifier.toLowerCase())
          .maybeSingle();

        if (!teacherLookup?.email) {
          recordFailedAttempt(limitKey);
          res.status(401).json({
            ok: false,
            code: 'INVALID_CREDENTIALS',
            message: 'Unable to sign in. Please check your login details and try again.',
          });
          return;
        }
        resolvedEmail = String(teacherLookup.email);
      }

      const { data: authData, error: authError } = await supabasePublic.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (authError || !authData.user) {
        recordFailedAttempt(limitKey);
        res.status(401).json({
          ok: false,
          code: 'INVALID_CREDENTIALS',
          message: 'Unable to sign in. Please check your login details and try again.',
        });
        return;
      }

      const { data: teacherProfile, error: profileError } = await supabaseAdmin
        .from('teacher_profiles')
        .select('id, display_name, email, school_name, is_active')
        .eq('auth_user_id', authData.user.id)
        .maybeSingle();

      if (profileError || !teacherProfile || !teacherProfile.is_active) {
        recordFailedAttempt(limitKey);
        res.status(403).json({
          ok: false,
          code: 'UNAUTHORIZED_ROLE',
          message: 'Unable to sign in. Please check your login details and try again.',
        });
        return;
      }

      const { data: assignedRows } = await supabaseAdmin
        .from('classes')
        .select('class_code')
        .eq('teacher_id', teacherProfile.id)
        .eq('is_active', true);

      clearRateLimit(limitKey);

      const teacherSession: TeacherSession = {
        role: 'teacher',
        id: String(teacherProfile.id),
        displayName: String(teacherProfile.display_name),
        email: String(teacherProfile.email),
        schoolName: String(teacherProfile.school_name ?? 'SJKC Ming Tao'),
        assignedClasses: Array.isArray(assignedRows)
          ? assignedRows.map((row) => String(row.class_code))
          : [],
      };

      const token = signSession(teacherSession);
      if (!token) {
        res.status(503).json({
          ok: false,
          code: 'BACKEND_NOT_CONFIGURED',
          message: 'Authentication backend is not configured yet.',
          missingEnv: ['AUTH_SESSION_SECRET'],
        });
        return;
      }

      setSessionCookie(res, req, token);
      res.json({
        ok: true,
        message: 'Welcome back! Redirecting to Teacher Control Centre.',
        session: teacherSession,
      });
    } catch {
      res.status(500).json({
        ok: false,
        code: 'NETWORK_ERROR',
        message: 'Unable to connect. Please check your internet connection.',
      });
    }
  });

  router.post('/parent-login', async (req: Request, res: Response) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      res.status(400).json({
        ok: false,
        code: 'EMPTY_FIELDS',
        message: 'Please enter your registered email and password.',
      });
      return;
    }

    const clientIp = getClientIp(req);
    const limitKey = `${clientIp}:parent:${email}`;
    const rateCheck = checkRateLimit(limitKey);
    if (!rateCheck.allowed) {
      res.status(429).json({
        ok: false,
        code: 'RATE_LIMITED',
        message: 'Please wait a moment before trying again.',
        retryAfterSeconds: rateCheck.retryAfterSeconds,
      });
      return;
    }

    const status = getBackendStatus();
    const supabaseAdmin = getSupabaseAdmin();
    const supabasePublic = getSupabasePublicAuthClient();
    if (!status.configured || !supabaseAdmin || !supabasePublic) {
      clearRateLimit(limitKey);
      const rawName = email.split('@')[0] || 'Parent';
      const formattedName = rawName
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (ch: string) => ch.toUpperCase());

      const previewParentSession: ParentSession = {
        role: 'parent',
        id: `preview-parent-${rawName.toLowerCase()}`,
        displayName: formattedName,
        email,
        linkedChildren: [
          {
            studentId: 'preview-student-1',
            displayName: 'Junior Detective (Year 5)',
            classCode: '5M',
            className: '5 Ming',
          },
        ],
      };

      const token = signSession(previewParentSession);
      if (token) {
        setSessionCookie(res, req, token);
      }
      res.json({
        ok: true,
        message: 'Signed in successfully. Opening Parent Dashboard.',
        session: previewParentSession,
      });
      return;
    }

    try {
      const { data: authData, error: authError } = await supabasePublic.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        recordFailedAttempt(limitKey);
        res.status(401).json({
          ok: false,
          code: 'INVALID_CREDENTIALS',
          message: 'Unable to sign in. Please check your login details and try again.',
        });
        return;
      }

      const { data: parentProfile, error: profileError } = await supabaseAdmin
        .from('parent_profiles')
        .select('id, display_name, email, is_active')
        .eq('auth_user_id', authData.user.id)
        .maybeSingle();

      if (profileError || !parentProfile || !parentProfile.is_active) {
        recordFailedAttempt(limitKey);
        res.status(403).json({
          ok: false,
          code: 'UNAUTHORIZED_ROLE',
          message: 'Unable to sign in. Please check your login details and try again.',
        });
        return;
      }

      const { data: linkRows, error: linkError } = await supabaseAdmin
        .from('parent_student_links')
        .select('student_id, students(id, display_name, classes(class_code, class_name))')
        .eq('parent_id', parentProfile.id)
        .eq('is_verified', true);

      if (linkError || !linkRows || linkRows.length === 0) {
        clearRateLimit(limitKey);
        res.status(403).json({
          ok: false,
          code: 'ACCOUNT_NOT_LINKED',
          message: 'This account is not linked to a student yet. Please contact the school for assistance.',
        });
        return;
      }

      const linkedChildren: LinkedChildSummary[] = linkRows
        .map((row: Record<string, unknown>) => {
          const studentObj = row.students as Record<string, unknown> | null;
          if (!studentObj) return null;
          const classObj = studentObj.classes as Record<string, unknown> | null;
          return {
            studentId: String(studentObj.id),
            displayName: String(studentObj.display_name),
            classCode: String(classObj?.class_code ?? ''),
            className: String(classObj?.class_name ?? ''),
          };
        })
        .filter((child): child is LinkedChildSummary => child !== null);

      if (linkedChildren.length === 0) {
        res.status(403).json({
          ok: false,
          code: 'ACCOUNT_NOT_LINKED',
          message: 'This account is not linked to a student yet. Please contact the school for assistance.',
        });
        return;
      }

      clearRateLimit(limitKey);

      const parentSession: ParentSession = {
        role: 'parent',
        id: String(parentProfile.id),
        displayName: String(parentProfile.display_name),
        email: String(parentProfile.email),
        linkedChildren,
      };

      const token = signSession(parentSession);
      if (!token) {
        res.status(503).json({
          ok: false,
          code: 'BACKEND_NOT_CONFIGURED',
          message: 'Authentication backend is not configured yet.',
          missingEnv: ['AUTH_SESSION_SECRET'],
        });
        return;
      }

      setSessionCookie(res, req, token);
      res.json({
        ok: true,
        message: 'Signed in successfully. Opening Parent Dashboard.',
        session: parentSession,
      });
    } catch {
      res.status(500).json({
        ok: false,
        code: 'NETWORK_ERROR',
        message: 'Unable to connect. Please check your internet connection.',
      });
    }
  });

  router.post('/forgot-password', async (req: Request, res: Response) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const portal = req.body?.portal as PortalType | undefined;

    if (!email || !email.includes('@')) {
      res.status(400).json({
        ok: false,
        code: 'EMPTY_FIELDS',
        message: 'Please enter your registered email address.',
      });
      return;
    }

    if (portal !== 'teacher' && portal !== 'parent') {
      res.status(400).json({
        ok: false,
        code: 'UNAUTHORIZED_ROLE',
        message: 'Password recovery is only available for teacher and parent accounts.',
      });
      return;
    }

    const clientIp = getClientIp(req);
    const limitKey = `${clientIp}:reset:${email}`;
    const rateCheck = checkRateLimit(limitKey);
    if (!rateCheck.allowed) {
      res.status(429).json({
        ok: false,
        code: 'RATE_LIMITED',
        message: 'Please wait a moment before trying again.',
      });
      return;
    }
    recordFailedAttempt(limitKey);

    const status = getBackendStatus();
    const supabasePublic = getSupabasePublicAuthClient();
    if (!status.configured || !supabasePublic) {
      res.json({
        ok: true,
        message:
          'If an account matches that email address, password reset instructions have been sent.',
      });
      return;
    }

    try {
      const appUrl = process.env.APP_URL?.trim();
      await supabasePublic.auth.resetPasswordForEmail(email, {
        redirectTo: appUrl ? `${appUrl}/reset-password` : undefined,
      });

      // Never expose whether the email belongs to an existing account
      res.json({
        ok: true,
        message:
          'If an account matches that email address, password reset instructions have been sent.',
      });
    } catch {
      res.status(500).json({
        ok: false,
        code: 'NETWORK_ERROR',
        message: 'Unable to connect. Please check your internet connection.',
      });
    }
  });

  return router;
}
