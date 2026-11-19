import type {
  AvatarConfig,
  AvatarPosition,
  BuildingId,
  GameSettings,
  InventoryState,
  TutorialProgress,
} from './game.ts';

export type PortalType = 'student' | 'teacher' | 'parent';

export type AuthErrorCode =
  | 'EMPTY_FIELDS'
  | 'INVALID_CREDENTIALS'
  | 'RATE_LIMITED'
  | 'ACCOUNT_NOT_LINKED'
  | 'UNAUTHORIZED_ROLE'
  | 'BACKEND_NOT_CONFIGURED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface BackendStatus {
  configured: boolean;
  missingEnv: string[];
}

export interface StudentProgressSummary {
  hasAvatar: boolean;
  detectiveNickname: string;
  avatarConfig: AvatarConfig | null;
  xp: number;
  stars: number;
  badges: string[];
  completedMissions: string[];
  lastPosition: string;
  tutorialProgress?: TutorialProgress;
  settings?: GameSettings;
  inventory?: InventoryState;
  unlockedBuildings?: BuildingId[];
  townPosition?: AvatarPosition;
  updatedAt?: number;
}

export interface StudentSession {
  role: 'student';
  id: string;
  studentCode: string;
  displayName: string;
  classCode: string;
  className: string;
  isFirstTime: boolean;
  progress: StudentProgressSummary;
}

export interface TeacherSession {
  role: 'teacher';
  id: string;
  displayName: string;
  email: string;
  schoolName: string;
  assignedClasses: string[];
}

export interface LinkedChildSummary {
  studentId: string;
  displayName: string;
  classCode: string;
  className: string;
}

export interface ParentSession {
  role: 'parent';
  id: string;
  displayName: string;
  email: string;
  linkedChildren: LinkedChildSummary[];
}

export type AuthenticatedSession = StudentSession | TeacherSession | ParentSession;

export interface AuthApiError {
  ok: false;
  code: AuthErrorCode;
  message: string;
  missingEnv?: string[];
  retryAfterSeconds?: number;
}

export interface AuthApiSuccess<T> {
  ok: true;
  message: string;
  session: T;
}

export type AuthApiResponse<T> = AuthApiSuccess<T> | AuthApiError;

export interface PasswordResetResponse {
  ok: boolean;
  code?: AuthErrorCode;
  message: string;
  missingEnv?: string[];
}
