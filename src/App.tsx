import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Lobby } from './components/Lobby';
import { GamePage } from './components/GamePage';
import { Scoreboard } from './components/Scoreboard';
import { CharacterCreation } from './components/CharacterCreation';
import { Inventory } from './components/Inventory';
import { Achievements } from './components/Achievements';
import { DiceTest } from './components/DiceTest';
import { useGameStore } from './store/gameStore';
import { Genre, Character, Achievement, InventoryItem } from './types/game';

type Page = 'lobby' | 'game' | 'scoreboard' | 'character' | 'inventory' | 'achievements' | 'dice-test';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<Genre>('fantasy');
  
  const {
    currentPlayer,
    character,
    achievements,
    inventory,
    showCharacterCreation,
    showInventory,
    showAchievements,
    setCurrentPlayer,
    setCharacter,
    addAchievement,
    addInventoryItem,
    removeInventoryItem,
    setShowCharacterCreation,
    setShowInventory,
    setShowAchievements,
    getTotalAchievementPoints,
    getInventoryWeight,
    getInventoryValue
  } = useGameStore();

  // Initialize demo data
  useEffect(() => {
    if (!currentPlayer) {
      setCurrentPlayer({
        id: 'demo-player',
        nickname: 'Demo Player',
        age: 25,
        genre: 'Fantasy',
        score: 0,
        titles: [],
        isHost: false,
        achievements: [],
        level: 1,
        experience: 0
      });
    }
  }, [currentPlayer, setCurrentPlayer]);

  const handleJoinRoom = (code: string, playerNickname: string, genre?: Genre) => {
    setRoomCode(code);
    setNickname(playerNickname);
    if (genre) {
      setSelectedGenre(genre);
    }
    setCurrentPage('game');
  };

  const handleCharacterCreate = (newCharacter: Character) => {
    setCharacter(newCharacter);
    setShowCharacterCreation(false);
    
    // Add some starting items
    const startingItems: InventoryItem[] = [
      {
        id: 'starter-sword',
        name: 'Rusty Sword',
        description: 'A basic sword that has seen better days',
        type: 'weapon',
        rarity: 'common',
        value: 10,
        weight: 3,
        quantity: 1,
        effects: [{ type: 'damage_bonus', target: 'attack', value: 1 }]
      },
      {
        id: 'starter-potion',
        name: 'Health Potion',
        description: 'A basic healing potion',
        type: 'consumable',
        rarity: 'common',
        value: 25,
        weight: 0.5,
        quantity: 2
      }
    ];
    
    startingItems.forEach(item => addInventoryItem(item));
    
    // Add first achievement
    const firstAchievement: Achievement = {
      id: 'first-character',
      name: 'Character Creator',
      description: 'Created your first character',
      icon: '🎭',
      points: 10,
      unlockedAt: new Date(),
      category: 'story'
    };
    addAchievement(firstAchievement);
  };

  const handleItemUse = (item: InventoryItem) => {
    // Handle item usage logic here
    console.log('Using item:', item.name);
  };

  const handleItemDrop = (itemId: string) => {
    removeInventoryItem(itemId);
  };

  const handleItemAdd = (item: InventoryItem) => {
    addInventoryItem(item);
  };

  const handleAchievementClick = (achievement: Achievement) => {
    console.log('Achievement clicked:', achievement.name);
  };

  const renderCurrentPage = () => {
    if (showCharacterCreation) {
      return (
        <CharacterCreation
          onCharacterCreate={handleCharacterCreate}
          onSkip={() => setShowCharacterCreation(false)}
        />
      );
    }

    if (showInventory) {
      return (
        <Inventory
          items={inventory}
          onItemUse={handleItemUse}
          onItemDrop={handleItemDrop}
          onItemAdd={handleItemAdd}
        />
      );
    }

    if (showAchievements) {
      return (
        <Achievements
          achievements={achievements}
          totalPoints={getTotalAchievementPoints()}
          onAchievementClick={handleAchievementClick}
        />
      );
    }

    switch (currentPage) {
      case 'lobby':
        return <Lobby onJoinRoom={handleJoinRoom} />;
      case 'game':
        return roomCode && nickname ? (
          <GamePage 
            roomCode={roomCode} 
            nickname={nickname} 
            genre={selectedGenre}
            character={character}
            onShowInventory={() => setShowInventory(true)}
            onShowAchievements={() => setShowAchievements(true)}
          />
        ) : (
          <Lobby onJoinRoom={handleJoinRoom} />
        );
      case 'scoreboard':
        return <Scoreboard players={[]} />;
      case 'character':
        return (
          <CharacterCreation
            onCharacterCreate={handleCharacterCreate}
            onSkip={() => setCurrentPage('lobby')}
          />
        );
      case 'inventory':
        return (
          <Inventory
            items={inventory}
            onItemUse={handleItemUse}
            onItemDrop={handleItemDrop}
            onItemAdd={handleItemAdd}
          />
        );
      case 'achievements':
        return (
          <Achievements
            achievements={achievements}
            totalPoints={getTotalAchievementPoints()}
            onAchievementClick={handleAchievementClick}
          />
        );
      case 'dice-test':
        return <DiceTest />;
      default:
        return <Lobby onJoinRoom={handleJoinRoom} />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderCurrentPage()}
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;