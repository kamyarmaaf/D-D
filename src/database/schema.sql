-- D&D Bolt Database Schema
-- This file contains the SQL schema for the D&D Bolt game database

-- Rooms table - stores room information
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('waiting', 'voting', 'playing', 'finished')),
    max_players INTEGER NOT NULL DEFAULT 6,
    selected_genre TEXT NOT NULL CHECK (selected_genre IN ('fantasy', 'historical', 'mystery', 'horror', 'comedy', 'scifi', 'jenabkhan')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    host_player_id TEXT,
    current_stage INTEGER DEFAULT 1,
    max_stages INTEGER DEFAULT 5,
    is_game_active BOOLEAN DEFAULT FALSE
);

-- Players table - stores player information
CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    nickname TEXT NOT NULL,
    age INTEGER NOT NULL,
    genre TEXT NOT NULL CHECK (genre IN ('Fantasy', 'Mystery', 'Horror', 'Comedy')),
    score INTEGER DEFAULT 0,
    titles TEXT DEFAULT '[]', -- JSON array of titles
    is_host BOOLEAN DEFAULT FALSE,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Characters table - stores character information
CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    race_name TEXT NOT NULL,
    strength INTEGER DEFAULT 10,
    dexterity INTEGER DEFAULT 10,
    constitution INTEGER DEFAULT 10,
    intelligence INTEGER DEFAULT 10,
    wisdom INTEGER DEFAULT 10,
    charisma INTEGER DEFAULT 10,
    hit_points INTEGER DEFAULT 10,
    max_hit_points INTEGER DEFAULT 10,
    armor_class INTEGER DEFAULT 10,
    speed INTEGER DEFAULT 30,
    backstory TEXT,
    avatar TEXT DEFAULT '🧙‍♂️',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Game sessions table - tracks each game session
CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    session_number INTEGER NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    total_stages INTEGER NOT NULL,
    completed_stages INTEGER DEFAULT 0,
    final_score INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'abandoned')),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Story stages table - tracks story progression
CREATE TABLE IF NOT EXISTS story_stages (
    id TEXT PRIMARY KEY,
    game_session_id TEXT NOT NULL,
    stage_number INTEGER NOT NULL,
    stage_description TEXT NOT NULL,
    selected_choice_id INTEGER,
    choice_text TEXT,
    dice_roll INTEGER,
    dice_result TEXT CHECK (dice_result IN ('success', 'failure')),
    dc_required INTEGER,
    stage_started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    stage_completed_at DATETIME,
    FOREIGN KEY (game_session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
);

-- Story choices table - stores available choices for each stage
CREATE TABLE IF NOT EXISTS story_choices (
    id TEXT PRIMARY KEY,
    story_stage_id TEXT NOT NULL,
    choice_id INTEGER NOT NULL,
    choice_text TEXT NOT NULL,
    dc_required INTEGER NOT NULL,
    is_selected BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (story_stage_id) REFERENCES story_stages(id) ON DELETE CASCADE
);

-- Messages table - stores game messages
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('player', 'ai', 'system', 'action')),
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    dice_roll INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Inventory items table - stores player inventory
CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    description TEXT,
    item_type TEXT NOT NULL CHECK (item_type IN ('weapon', 'armor', 'consumable', 'tool', 'misc')),
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    value INTEGER DEFAULT 0,
    weight REAL DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    effects TEXT DEFAULT '[]', -- JSON array of effects
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Achievements table - stores player achievements
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    category TEXT NOT NULL CHECK (category IN ('combat', 'exploration', 'social', 'story', 'special')),
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_characters_player_id ON characters(player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_room_id ON game_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_story_stages_session_id ON story_stages(game_session_id);
CREATE INDEX IF NOT EXISTS idx_story_choices_stage_id ON story_choices(story_stage_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_inventory_player_id ON inventory_items(player_id);
CREATE INDEX IF NOT EXISTS idx_achievements_player_id ON achievements(player_id);
