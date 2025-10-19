export interface Player {
  id: string;
  nickname: string;
  email?: string;
  age: number;
  genre: 'Fantasy' | 'Mystery' | 'Horror' | 'Comedy';
  score: number;
  titles: string[];
  isHost: boolean;
  character?: Character;
  achievements: Achievement[];
  level: number;
  experience: number;
  roomId?: string;
}

export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  race: CharacterRace;
  stats: CharacterStats;
  inventory: InventoryItem[];
  spells: Spell[];
  equipment: Equipment;
  backstory: string;
  avatar: string;
}

export interface CharacterStats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hitPoints: number;
  maxHitPoints: number;
  armorClass: number;
  speed: number;
}

export interface CharacterClass {
  name: string;
  description: string;
  hitDie: number;
  primaryAbility: string[];
  savingThrowProficiencies: string[];
  skillProficiencies: string[];
  features: string[];
}

export interface CharacterRace {
  name: string;
  description: string;
  abilityScoreIncrease: Record<string, number>;
  size: string;
  speed: number;
  traits: string[];
  languages: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'tool' | 'misc';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  weight: number;
  quantity: number;
  effects?: ItemEffect[];
}

export interface ItemEffect {
  type: 'stat_bonus' | 'damage_bonus' | 'resistance' | 'immunity' | 'special';
  target: string;
  value: number;
  duration?: number;
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string[];
  duration: string;
  description: string;
  damage?: SpellDamage;
  effects?: string[];
}

export interface SpellDamage {
  dice: string;
  type: string;
  bonus?: number;
}

export interface Equipment {
  weapon?: InventoryItem;
  armor?: InventoryItem;
  shield?: InventoryItem;
  accessories: InventoryItem[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: Date;
  category: 'dice' | 'progress' | 'victory' | 'score' | 'level' | 'choice' | 'special';
}

export interface Room {
  id: string;
  code: string;
  players: Player[];
  status: 'waiting' | 'voting' | 'playing' | 'finished';
  maxPlayers: number;
  createdAt: Date;
  selectedGenre?: string;
  hostPlayerId?: string;
  currentStage?: number;
  maxStages?: number;
  isGameActive?: boolean;
}

export interface Message {
  id: string;
  type: 'player' | 'ai' | 'system' | 'action';
  sender: string;
  content: string;
  timestamp: Date;
  diceRoll?: number;
}

export interface GameState {
  currentTurn: number;
  phase: 'voting' | 'playing' | 'scoring' | 'finished';
  votes: Record<string, number>;
  scenarios: string[];
  selectedScenario?: number;
  storyProgress: string[];
  currentStage: number;
  maxStages: number;
  isGameActive: boolean;
  pendingChoice: boolean;
  waitingForDiceRoll?: boolean;
  selectedChoice?: {
    choiceId: number;
    choiceText: string;
    dc: number;
  };
  autoProgressAudio?: boolean;
  // Game end conditions
  gameEnd?: {
    type: 'win' | 'lose' | 'timeout' | 'abandoned';
    reason: string;
    finalScore?: number;
    completedStages: number;
    totalStages: number;
    endMessage: string;
  };
}

export interface StoryStage {
  stage: number;
  description: string;
  choices: StoryChoice[];
  selectedChoice?: {
    choiceId: number;
    choiceText: string;
    dc: number;
  };
  diceRoll?: number;
  diceResult?: 'success' | 'failure';
  stageCompletedAt?: Date;
}

export interface StoryChoice {
  id: number;
  text: string;
  dc: number;
  selected?: boolean;
  result?: 'success' | 'failure';
  diceRoll?: number;
}

export interface StoryScenario {
  id: number;
  title: string;
  description: string;
  genre: string;
  votes: number;
}

export type Language = 'en' | 'fa';

export type Genre = 'fantasy' | 'historical' | 'mystery' | 'horror' | 'comedy' | 'scifi' | 'jenabkhan';

export interface GameSettings {
  language: Language;
  genre: Genre;
  maxPlayers: number;
}

// ==== Storyflow API DTOs (client <-> n8n) ====

export type StoryflowChoice = Pick<StoryChoice, "id" | "text" | "dc">;

export interface StartRequest {
  room_id: string;
  genre: Genre;                       // از تایپ‌های خودت
  players?: { name: string }[];       // اختیاری
  seed?: number;                      // اختیاری برای تکرارپذیری
}

export interface StepRequest {
  room_id: string;
  choice_id?: number;                 // وقتی یکی از گزینه‌ها کلیک شد
  free_text?: string;                 // اگر ورودی آزاد داری
  dice?: { d20?: number };            // اگر رول تاس می‌فرستی
  state_version: number;              // از پاسخ قبلی می‌گیری
}

export interface StoryResponse {
  stage: number;
  narration: string;
  choices: StoryflowChoice[];         // 2 تا 4 گزینهٔ بعدی
  is_game_over: boolean;
  state_version: number;              // برای همگام‌سازی درخواست بعدی
  // Game end information
  game_end?: {
    type: 'win' | 'lose' | 'timeout' | 'abandoned';
    reason: string;
    final_score?: number;
    completed_stages: number;
    total_stages: number;
    end_message: string;
  };
  // اختیاری: اگر n8n خروجی صدا بده
  audio?: { format: "mp3" | "wav"; base64: string } | { url: string };
}

// ==== Webhook API DTOs ====

export interface WebhookRequest {
  room_id: string;
  genre: string;
  stage: number;
  user_choice: string;
  user_dice: string;
}

export interface WebhookResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface N8nStoryResponse {
  id: number;
  created_at: string;
  stage: number;
  room_id: string;
  genre: string;
  choice1: string;
  choice2: string;
  choice3: string;
  description: string;
  stage_text: string;
}

