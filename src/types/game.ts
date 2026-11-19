export type SkinToneId = 'fair' | 'light' | 'medium' | 'tan' | 'brown' | 'deep';
export type HairStyleId = 'short' | 'long' | 'curly' | 'bob' | 'spiky' | 'pigtails';
export type HairColorId = 'black' | 'dark-brown' | 'chestnut' | 'blonde' | 'auburn' | 'midnight';
export type OutfitStyleId = 'hoodie' | 'jacket' | 'polo' | 'casual' | 'overalls';
export type OutfitColorId = 'aqua' | 'mint' | 'lavender' | 'gold' | 'coral' | 'navy';
export type AccessoryId = 'none' | 'glasses' | 'headband' | 'cap' | 'backpack' | 'magnifier-pin';
export type ShoeStyleId = 'trainers' | 'boots' | 'casual';
export type ShoeColorId = 'white' | 'sky' | 'charcoal' | 'berry';
export type BaseAppearanceId = 'cheerful' | 'curious' | 'friendly' | 'bold';

export interface AvatarConfig {
  baseStyle: BaseAppearanceId;
  skinTone: SkinToneId;
  hairStyle: HairStyleId;
  hairColor: HairColorId;
  outfitStyle: OutfitStyleId;
  outfitColor: OutfitColorId;
  accessory: AccessoryId;
  shoesStyle: ShoeStyleId;
  shoesColor: ShoeColorId;
}

export type BuildingId =
  | 'detective-hq'
  | 'red-flag-centre'
  | 'ainas-house'
  | 'cyber-cafe'
  | 'advice-centre'
  | 'game-arcade'
  | 'digital-safe-garden';

export interface BuildingDefinition {
  id: BuildingId;
  name: string;
  description: string;
  pusheenLine: string;
  order: number;
  x: number; // percentage (0-100) on town map
  y: number; // percentage (0-100) on town map
  entranceNodeId: string;
  accentColor: string;
  glassGradient: string;
}

export interface TutorialProgress {
  characterConfirmed: boolean;
  welcomeConversationDone: boolean;
  profileExplored: boolean;
  bagExplored: boolean;
  missionTrackerExplored: boolean;
  settingsExplored: boolean;
  buildingsDiscovered: BuildingId[];
  movementCompleted: boolean;
  hqSelected: boolean;
  tutorialCompleted: boolean;
}

export interface GameSettings {
  soundEffects: boolean;
  backgroundMusic: boolean;
  dialogueNarration: boolean;
  subtitles: boolean;
  textSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'badges' | 'collectibles' | 'mission-items' | 'special-rewards';
  description: string;
}

export interface InventoryState {
  badges: InventoryItem[];
  collectibles: InventoryItem[];
  missionItems: InventoryItem[];
  specialRewards: InventoryItem[];
}

export interface AvatarPosition {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  nodeId: string;
}

export interface StudentGameState {
  detectiveNickname: string;
  avatarConfig: AvatarConfig | null;
  tutorialProgress: TutorialProgress;
  settings: GameSettings;
  inventory: InventoryState;
  xp: number;
  stars: number;
  level: number;
  currentMission: string;
  completedMissions: string[];
  unlockedBuildings: BuildingId[];
  lastPosition: AvatarPosition;
  lastScene: 'customisation' | 'cinematic' | 'town' | 'screen-03-handoff';
  updatedAt: number;
}

export type DialogueCharacterId =
  | 'pusheen'
  | 'player'
  | 'aina'
  | 'daniel'
  | 'byte'
  | 'teacher-chelsea'
  | 'ainas-mother';

export type DialogueExpression =
  | 'happy'
  | 'curious'
  | 'thinking'
  | 'surprised'
  | 'excited'
  | 'worried'
  | 'encouraging'
  | 'celebrating';

export interface DialogueChoice {
  id: string;
  label: string;
}

export interface DialogueStep {
  id: string;
  speaker: DialogueCharacterId;
  speakerName?: string;
  expression: DialogueExpression;
  text: string;
  choices?: DialogueChoice[];
}

export type SaveSyncStatus = 'idle' | 'saving' | 'saved' | 'offline';
