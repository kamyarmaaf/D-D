import express from 'express';
import sqlite3 from 'sqlite3';
const { verbose } = sqlite3;
import path from 'path';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'data', 'dnd_bolt.db');
const db = new verbose().Database(dbPath);

// Create tables
db.serialize(() => {
  // Rooms table
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('waiting', 'voting', 'playing', 'finished')),
      max_players INTEGER NOT NULL DEFAULT 6,
      selected_genre TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      host_player_id TEXT,
      current_stage INTEGER DEFAULT 1,
      max_stages INTEGER DEFAULT 5,
      is_game_active BOOLEAN DEFAULT FALSE
    )
  `);

  // Players table
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      nickname TEXT NOT NULL,
      age INTEGER NOT NULL,
      genre TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      titles TEXT DEFAULT '[]',
      is_host BOOLEAN DEFAULT FALSE,
      level INTEGER DEFAULT 1,
      experience INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Characters table
  db.run(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('player', 'ai', 'system', 'action')),
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      dice_roll INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inventory items table
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      description TEXT,
      item_type TEXT NOT NULL,
      rarity TEXT NOT NULL,
      value INTEGER DEFAULT 0,
      weight REAL DEFAULT 0,
      quantity INTEGER DEFAULT 1,
      effects TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Achievements table
  db.run(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      achievement_name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      category TEXT NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// API Routes

// Get database info
app.get('/api/database/info', (req, res) => {
  res.json({
    name: 'DnDBoltDB',
    version: 1,
    type: 'SQLite File',
    path: dbPath,
    status: 'connected'
  });
});

// Room operations
app.post('/api/rooms', (req, res) => {
  const { id, code, status, max_players, selected_genre, created_at, host_player_id, current_stage, max_stages, is_game_active } = req.body;
  
  const sql = `
    INSERT INTO rooms (id, code, status, max_players, selected_genre, created_at, host_player_id, current_stage, max_stages, is_game_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [id, code, status, max_players, selected_genre, created_at, host_player_id, current_stage, max_stages, is_game_active], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, message: 'Room created successfully' });
  });
});

app.get('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM rooms WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.get('/api/rooms/code/:code', (req, res) => {
  const { code } = req.params;
  
  db.get('SELECT * FROM rooms WHERE code = ?', [code], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Player operations
app.post('/api/players', (req, res) => {
  const { id, room_id, nickname, age, genre, score, titles, is_host, level, experience } = req.body;
  
  const sql = `
    INSERT INTO players (id, room_id, nickname, age, genre, score, titles, is_host, level, experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [id, room_id, nickname, age, genre, score, titles, is_host, level, experience], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, message: 'Player created successfully' });
  });
});

app.get('/api/players/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM players WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.get('/api/players/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  
  db.all('SELECT * FROM players WHERE room_id = ?', [roomId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Character operations
app.post('/api/characters', (req, res) => {
  const { id, player_id, name, class_name, race_name, strength, dexterity, constitution, intelligence, wisdom, charisma, hit_points, max_hit_points, armor_class, speed, backstory, avatar } = req.body;
  
  const sql = `
    INSERT INTO characters (id, player_id, name, class_name, race_name, strength, dexterity, constitution, intelligence, wisdom, charisma, hit_points, max_hit_points, armor_class, speed, backstory, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [id, player_id, name, class_name, race_name, strength, dexterity, constitution, intelligence, wisdom, charisma, hit_points, max_hit_points, armor_class, speed, backstory, avatar], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, message: 'Character created successfully' });
  });
});

app.get('/api/characters/player/:playerId', (req, res) => {
  const { playerId } = req.params;
  
  db.get('SELECT * FROM characters WHERE player_id = ?', [playerId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Message operations
app.post('/api/messages', (req, res) => {
  const { id, room_id, type, sender, content, dice_roll, timestamp } = req.body;
  
  const sql = `
    INSERT INTO messages (id, room_id, type, sender, content, dice_roll, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [id, room_id, type, sender, content, dice_roll, timestamp], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, message: 'Message created successfully' });
  });
});

app.get('/api/messages/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  
  db.all('SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp ASC', [roomId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Achievement operations
app.post('/api/achievements', (req, res) => {
  const { id, player_id, achievement_name, description, icon, points, category, unlocked_at } = req.body;
  
  const sql = `
    INSERT INTO achievements (id, player_id, achievement_name, description, icon, points, category, unlocked_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [id, player_id, achievement_name, description, icon, points, category, unlocked_at], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, message: 'Achievement created successfully' });
  });
});

app.get('/api/achievements/player/:playerId', (req, res) => {
  const { playerId } = req.params;
  
  db.all('SELECT * FROM achievements WHERE player_id = ? ORDER BY unlocked_at DESC', [playerId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Inventory operations
app.post('/api/inventory', (req, res) => {
  const { id, player_id, item_name, description, item_type, rarity, value, weight, quantity, effects } = req.body;
  
  const sql = `
    INSERT INTO inventory_items (id, player_id, item_name, description, item_type, rarity, value, weight, quantity, effects)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [id, player_id, item_name, description, item_type, rarity, value, weight, quantity, effects], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, message: 'Inventory item created successfully' });
  });
});

app.get('/api/inventory/player/:playerId', (req, res) => {
  const { playerId } = req.params;
  
  db.all('SELECT * FROM inventory_items WHERE player_id = ? ORDER BY created_at DESC', [playerId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// N8N Proxy endpoint to handle CORS
app.post('/api/n8n/story', async (req, res) => {
  try {
    console.log('Proxying request to n8n:', req.body);
    
    const n8nResponse = await fetch('https://n8nserver.zer0team.ir/webhook-test/dnd-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    if (!n8nResponse.ok) {
      throw new Error(`HTTP error! status: ${n8nResponse.status}`);
    }

    const data = await n8nResponse.json();
    console.log('N8N response:', data);
    
    res.json(data);
  } catch (error) {
    console.error('N8N proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to story service',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Database server running on http://localhost:${PORT}`);
  console.log(`📁 Database file: ${dbPath}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down database server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});
