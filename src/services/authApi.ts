import type {
  AuthApiResponse,
  AuthenticatedSession,
  BackendStatus,
  ParentSession,
  PasswordResetResponse,
  PortalType,
  StudentSession,
  TeacherSession,
} from '../types/auth.ts';

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchBackendStatus(): Promise<BackendStatus> {
  try {
    const res = await fetch('/api/auth/status', {
      method: 'GET',
      credentials: 'same-origin',
    });
    const data = await parseJsonSafe<{ configured?: boolean; missingEnv?: string[] }>(res);
    return {
      configured: Boolean(data?.configured),
      missingEnv: Array.isArray(data?.missingEnv) ? data.missingEnv : [],
    };
  } catch {
    return { configured: false, missingEnv: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'AUTH_SESSION_SECRET'] };
  }
}

export async function fetchCurrentSession(): Promise<AuthenticatedSession | null> {
  try {
    const res = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'same-origin',
    });
    if (!res.ok) return null;
    const data = await parseJsonSafe<{ session?: AuthenticatedSession | null }>(res);
    return data?.session ?? null;
  } catch {
    return null;
  }
}

export async function loginStudent(payload: {
  classCode: string;
  studentId: string;
  pin: string;
}): Promise<AuthApiResponse<StudentSession>> {
  try {
    const res = await fetch('/api/auth/student-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe<AuthApiResponse<StudentSession>>(res);
    if (data) return data;
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: "Oops! We couldn't connect. Please check your internet connection and try again.",
    };
  } catch {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: "Oops! We couldn't connect. Please check your internet connection and try again.",
    };
  }
}

export async function loginTeacher(payload: {
  identifier: string;
  password: string;
}): Promise<AuthApiResponse<TeacherSession>> {
  try {
    const res = await fetch('/api/auth/teacher-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe<AuthApiResponse<TeacherSession>>(res);
    if (data) return data;
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect. Please check your internet connection.',
    };
  } catch {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect. Please check your internet connection.',
    };
  }
}

export async function loginParent(payload: {
  email: string;
  password: string;
}): Promise<AuthApiResponse<ParentSession>> {
  try {
    const res = await fetch('/api/auth/parent-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe<AuthApiResponse<ParentSession>>(res);
    if (data) return data;
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect. Please check your internet connection.',
    };
  } catch {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect. Please check your internet connection.',
    };
  }
}

export async function requestPasswordReset(payload: {
  email: string;
  portal: Extract<PortalType, 'teacher' | 'parent'>;
}): Promise<PasswordResetResponse> {
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe<PasswordResetResponse>(res);
    if (data) return data;
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect. Please check your internet connection.',
    };
  } catch {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect. Please check your internet connection.',
    };
  }
}

export async function logoutSession(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
  } catch {
    // Ignore network failures on client logout cleanup
  }
}
