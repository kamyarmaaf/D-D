import { useState, useEffect } from 'react';
import { Language } from '../types/game';

interface Translations {
  [key: string]: {
    en: string;
    fa: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.lobby': { en: 'Lobby', fa: 'لابی' },
  'nav.game': { en: 'Game', fa: 'بازی' },
  'nav.scoreboard': { en: 'Scoreboard', fa: 'جدول امتیازات' },
  'nav.character': { en: 'Character', fa: 'شخصیت' },
  'nav.inventory': { en: 'Inventory', fa: 'موجودی' },
  'nav.achievements': { en: 'Achievements', fa: 'دستاوردها' },
  
  // App Title
  'app.title': { en: 'Tales of Adventure', fa: 'Tales of Adventure' },
  'app.subtitle': { en: 'Where Stories Come Alive', fa: 'Where Stories Come Alive' },
  
  // Lobby
  'lobby.title': { en: 'Tales of Adventure', fa: 'Tales of Adventure' },
  'lobby.subtitle': { en: 'Where Stories Come Alive', fa: 'Where Stories Come Alive' },
  'lobby.createRoom': { en: 'Create Room', fa: 'ایجاد اتاق' },
  'lobby.joinRoom': { en: 'Join Room', fa: 'ورود به اتاق' },
  'lobby.nickname': { en: 'Adventurer Name', fa: 'Adventurer Name' },
  'lobby.roomCode': { en: 'Chapter Code', fa: 'Chapter Code' },
  'lobby.enterCode': { en: 'Enter chapter code', fa: 'Enter chapter code' },
  'lobby.selectGenre': { en: 'Select Story Genre', fa: 'Select Story Genre' },
  'lobby.genreDescription': { en: 'Choose the type of adventure you want to experience', fa: 'Choose the type of adventure you want to experience' },
  'lobby.startAdventure': { en: 'Start a new adventure as the host', fa: 'Start a new adventure as the host' },
  'lobby.joinAdventure': { en: 'Join an existing adventure', fa: 'Join an existing adventure' },
  'lobby.roomCreated': { en: 'Chapter Created Successfully!', fa: 'Chapter Created Successfully!' },
  'lobby.shareCode': { en: 'Share this code with your friends or let them scan the QR code', fa: 'Share this code with your friends or let them scan the QR code' },
  'lobby.quickStart': { en: 'Quick Start (Fantasy)', fa: 'Quick Start (Fantasy)' },
  'lobby.chooseGenre': { en: 'Choose Genre', fa: 'Choose Genre' },
  'lobby.friendsJoin': { en: 'Your friends can join using code', fa: 'Your friends can join using code' },
  'lobby.liveMultiplayer': { en: 'Live Multiplayer', fa: 'Live Multiplayer' },
  'lobby.aiGameMaster': { en: 'AI Game Master', fa: 'AI Game Master' },
  'lobby.realTimeDice': { en: 'Real-time Dice', fa: 'Real-time Dice' },
  'lobby.qrSharing': { en: 'QR Code Sharing', fa: 'QR Code Sharing' },
  'lobby.qrDescription': { en: 'Share room codes instantly with QR codes for seamless joining', fa: 'Share room codes instantly with QR codes for seamless joining' },
  'lobby.realtimeMultiplayer': { en: 'Real-time Multiplayer', fa: 'Real-time Multiplayer' },
  'lobby.realtimeDescription': { en: 'Play with friends in real-time adventures with live updates', fa: 'Play with friends in real-time adventures with live updates' },
  'lobby.aiDescription': { en: 'Dynamic storytelling powered by advanced AI technology', fa: 'Dynamic storytelling powered by advanced AI technology' },
  
  // Info Banner
  'banner.title': { en: 'about game', fa: 'آموزش بازی' },
  'banner.description': { 
    en: 'In Tales of Adventure you form a group and enter each chapter with the chapter code. Scores, inventory and achievements are updated live. If you are the host, create a "new room" and share the chapter code with your friends; if you are a player, join the group by entering the code.', 
    fa: 'در Tales of Adventure شما یک گروه تشکیل می‌دهید و در هر فصل با رمزِ فصل وارد می‌شوید. امتیازها، موجودی و دستاوردها به‌صورت زنده به‌روز می‌شوند. اگر میزبان هستید «اتاق جدید» بسازید و کد فصل را با دوستانتان به اشتراک بگذارید؛ اگر بازیکن هستید با وارد کردن کد به جمع بپیوندید.' 
  },
  
  // Genres
  'genre.fantasy': { en: 'Fantasy', fa: 'Fantasy' },
  'genre.fantasy.desc': { en: 'Magic, dragons, and epic adventures', fa: 'Magic, dragons, and epic adventures' },
  'genre.historical': { en: 'Historical', fa: 'Historical' },
  'genre.historical.desc': { en: 'Journey to the past and historical events', fa: 'Journey to the past and historical events' },
  'genre.mystery': { en: 'Mystery', fa: 'Mystery' },
  'genre.mystery.desc': { en: 'Secrets, crimes, and detective work', fa: 'Secrets, crimes, and detective work' },
  'genre.horror': { en: 'Horror', fa: 'Horror' },
  'genre.horror.desc': { en: 'Terror, monsters, and scary adventures', fa: 'Terror, monsters, and scary adventures' },
  'genre.comedy': { en: 'Comedy', fa: 'Comedy' },
  'genre.comedy.desc': { en: 'Laughter, humor, and funny adventures', fa: 'Laughter, humor, and funny adventures' },
  'genre.scifi': { en: 'Sci-Fi', fa: 'Sci-Fi' },
  'genre.scifi.desc': { en: 'Future, technology, and space', fa: 'Future, technology, and space' },
  'genre.jenabkhan': { en: 'Jenabkhan', fa: 'جنابخان' },
  'genre.jenabkhan.desc': { en: 'Persian adventure with magic and mystery', fa: 'ماجراجویی فارسی با جادو و راز' },
  
  // Game
  'game.chatPlaceholder': { en: 'Describe your action...', fa: 'Describe your action...' },
  'game.rollDice': { en: 'Roll Dice', fa: 'Roll Dice' },
  'game.send': { en: 'Send', fa: 'ارسال' },
  'game.gameMaster': { en: 'Game Master', fa: 'مدیر بازی' },
  'game.chapter': { en: 'Chapter', fa: 'Chapter' },
  'game.adventurer': { en: 'Adventurer', fa: 'Adventurer' },
  'game.tale': { en: 'Tale', fa: 'Tale' },
  'game.adventureLog': { en: 'Adventure Log', fa: 'Adventure Log' },
  'game.followJourney': { en: 'Follow your journey through the story', fa: 'Follow your journey through the story' },
  'game.timeToRoll': { en: 'Time to Roll!', fa: 'Time to Roll!' },
  'game.rollToSucceed': { en: 'You need to roll {dc} or higher to succeed', fa: 'You need to roll {dc} or higher to succeed' },
  'game.rollDiceButton': { en: 'Roll Dice!', fa: 'Roll Dice!' },
  'game.rolling': { en: 'Rolling...', fa: 'Rolling...' },
  'game.chooseAction': { en: 'Choose Your Action', fa: 'Choose Your Action' },
  'game.selectOption': { en: 'Select one of the following options to continue your adventure', fa: 'Select one of the following options to continue your adventure' },
  'game.option': { en: 'Option', fa: 'Option' },
  'game.stage': { en: 'Stage', fa: 'Stage' },
  'game.status': { en: 'Status', fa: 'Status' },
  'game.action': { en: 'Action', fa: 'Action' },
  'game.active': { en: 'Active', fa: 'Active' },
  'game.finished': { en: 'Finished', fa: 'Finished' },
  'game.choose': { en: 'Choose', fa: 'Choose' },
  'game.rollDiceAction': { en: 'Roll Dice', fa: 'Roll Dice' },
  'game.ready': { en: 'Ready', fa: 'Ready' },
  'game.connected': { en: 'Connected', fa: 'Connected' },
  'game.connecting': { en: 'Connecting...', fa: 'Connecting...' },
  'game.inventory': { en: 'Inventory', fa: 'موجودی' },
  'game.achievements': { en: 'Achievements', fa: 'دستاوردها' },
  
  // Character Creation
  'character.create': { en: 'Create Your Character', fa: 'Create Your Character' },
  'character.buildHero': { en: 'Build your hero for the adventure ahead', fa: 'Build your hero for the adventure ahead' },
  'character.name': { en: 'Character Name', fa: 'Character Name' },
  'character.class': { en: 'Class', fa: 'Class' },
  'character.race': { en: 'Race', fa: 'Race' },
  'character.stats': { en: 'Stats', fa: 'Stats' },
  'character.backstory': { en: 'Backstory', fa: 'Backstory' },
  'character.avatar': { en: 'Avatar', fa: 'Avatar' },
  'character.strength': { en: 'Strength', fa: 'Strength' },
  'character.dexterity': { en: 'Dexterity', fa: 'Dexterity' },
  'character.constitution': { en: 'Constitution', fa: 'Constitution' },
  'character.intelligence': { en: 'Intelligence', fa: 'Intelligence' },
  'character.wisdom': { en: 'Wisdom', fa: 'Wisdom' },
  'character.charisma': { en: 'Charisma', fa: 'Charisma' },
  'character.hitPoints': { en: 'Hit Points', fa: 'Hit Points' },
  'character.armorClass': { en: 'Armor Class', fa: 'Armor Class' },
  'character.speed': { en: 'Speed', fa: 'Speed' },
  'character.createButton': { en: 'Create Character', fa: 'Create Character' },
  'character.skip': { en: 'Skip for Now', fa: 'Skip for Now' },
  
  // Inventory
  'inventory.title': { en: 'Inventory', fa: 'Inventory' },
  'inventory.manageItems': { en: 'Manage your items and equipment', fa: 'Manage your items and equipment' },
  'inventory.totalWeight': { en: 'Total Weight', fa: 'Total Weight' },
  'inventory.totalValue': { en: 'Total Value', fa: 'Total Value' },
  'inventory.addItem': { en: 'Add Item', fa: 'Add Item' },
  'inventory.use': { en: 'Use', fa: 'Use' },
  'inventory.drop': { en: 'Drop', fa: 'Drop' },
  'inventory.quantity': { en: 'Quantity', fa: 'Quantity' },
  'inventory.weight': { en: 'Weight', fa: 'Weight' },
  'inventory.value': { en: 'Value', fa: 'Value' },
  'inventory.rarity': { en: 'Rarity', fa: 'Rarity' },
  'inventory.common': { en: 'Common', fa: 'Common' },
  'inventory.uncommon': { en: 'Uncommon', fa: 'Uncommon' },
  'inventory.rare': { en: 'Rare', fa: 'Rare' },
  'inventory.epic': { en: 'Epic', fa: 'Epic' },
  'inventory.legendary': { en: 'Legendary', fa: 'Legendary' },
  'inventory.weapon': { en: 'Weapon', fa: 'Weapon' },
  'inventory.armor': { en: 'Armor', fa: 'Armor' },
  'inventory.consumable': { en: 'Consumable', fa: 'Consumable' },
  'inventory.tool': { en: 'Tool', fa: 'Tool' },
  'inventory.misc': { en: 'Miscellaneous', fa: 'Miscellaneous' },
  
  // Achievements
  'achievements.title': { en: 'Achievements', fa: 'Achievements' },
  'achievements.trackProgress': { en: 'Track your progress and accomplishments', fa: 'Track your progress and accomplishments' },
  'achievements.totalPoints': { en: 'Total Points', fa: 'Total Points' },
  'achievements.unlocked': { en: 'Unlocked', fa: 'Unlocked' },
  'achievements.locked': { en: 'Locked', fa: 'Locked' },
  'achievements.points': { en: 'Points', fa: 'Points' },
  'achievements.category': { en: 'Category', fa: 'Category' },
  'achievements.story': { en: 'Story', fa: 'Story' },
  'achievements.combat': { en: 'Combat', fa: 'Combat' },
  'achievements.exploration': { en: 'Exploration', fa: 'Exploration' },
  'achievements.social': { en: 'Social', fa: 'Social' },
  'achievements.special': { en: 'Special', fa: 'Special' },
  
  // Common
  'common.loading': { en: 'Loading...', fa: 'Loading...' },
  'common.back': { en: 'Back', fa: 'Back' },
  'common.continue': { en: 'Continue', fa: 'Continue' },
  'common.start': { en: 'Start Game', fa: 'Start Game' },
  'common.save': { en: 'Save', fa: 'Save' },
  'common.cancel': { en: 'Cancel', fa: 'Cancel' },
  'common.confirm': { en: 'Confirm', fa: 'Confirm' },
  'common.close': { en: 'Close', fa: 'Close' },
  'common.next': { en: 'Next', fa: 'Next' },
  'common.previous': { en: 'Previous', fa: 'Previous' },
  'common.finish': { en: 'Finish', fa: 'Finish' },
  
  // Audio Controls
  'audio.enableNarration': { en: 'Enable Audio Narration', fa: 'فعال‌سازی روایت صوتی' },
  'audio.disableNarration': { en: 'Disable Audio Narration', fa: 'غیرفعال‌سازی روایت صوتی' },
  'audio.settings': { en: 'Settings', fa: 'تنظیمات' },
  'audio.voice': { en: 'Voice', fa: 'صدا' },
  'audio.speed': { en: 'Speed', fa: 'سرعت' },
  'audio.autoPlay': { en: 'Auto-play audio', fa: 'پخش خودکار صدا' },
  'audio.autoProgress': { en: 'Auto-progress story', fa: 'پیشرفت خودکار داستان' }
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('dnd-language') as Language;
    if (savedLang && ['en', 'fa'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('dnd-language', lang);
    // Auto-refresh page after language change
    window.location.reload();
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return { language, changeLanguage, t };
};