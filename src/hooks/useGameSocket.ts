import { useState, useEffect, useRef } from 'react';
import { Message, GameState, Genre } from '../types/game';
import { useAudioStory } from './useAudioStory';
import { useVoicePlayback } from './useVoicePlayback';
import { useSmartAudio } from './useSmartAudio';

interface StoryStage {
  stage: number;
  description: string;
  choices: Array<{
    id: number;
    text: string;
    dc: number;
  }>;
}

export const useGameSocket = (roomCode: string, genre: Genre = 'fantasy') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentStage, setCurrentStage] = useState<StoryStage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentStoryText, setCurrentStoryText] = useState<string>('');
  const socketRef = useRef<WebSocket | null>(null);
  
  // Audio story hook for TTS integration
  const audioStory = useAudioStory(
    currentStoryText,
    () => {
      // Auto-progress after audio completes (if enabled)
      if (gameState?.autoProgressAudio) {
        handleAutoProgress();
      }
    },
    (error) => {
      console.error('Audio story error:', error);
      // Continue with text-only mode on error
      if (gameState?.autoProgressAudio) {
        handleAutoProgress();
      }
    }
  );

  // Voice playback hook for playing voice files
  const voicePlayback = useVoicePlayback(
    currentStoryText,
    genre,
    currentStage?.stage || 1,
    () => {
      // Auto-progress after voice completes (if enabled)
      if (gameState?.autoProgressAudio) {
        handleAutoProgress();
      }
    },
    (error) => {
      console.error('Voice playback error:', error);
      // Continue with text-only mode on error
      if (gameState?.autoProgressAudio) {
        handleAutoProgress();
      }
    }
  );

  // Smart audio hook that combines voice files and TTS
  const smartAudio = useSmartAudio(
    currentStoryText,
    genre,
    currentStage?.stage || 1,
    () => {
      // Auto-progress after audio completes (if enabled)
      if (gameState?.autoProgressAudio) {
        handleAutoProgress();
      }
    },
    (error) => {
      console.error('Smart audio error:', error);
      // Continue with text-only mode on error
      if (gameState?.autoProgressAudio) {
        handleAutoProgress();
      }
    }
  );

  // Auto-progress handler for seamless story flow
  const handleAutoProgress = () => {
    if (!currentStage || !gameState) return;
    
    // If there are choices, don't auto-progress
    if (currentStage.choices && currentStage.choices.length > 0) {
      return;
    }
    
    // Auto-progress to next stage or end game
    setTimeout(() => {
      if (gameState.currentStage >= gameState.maxStages) {
        endGame(true);
      } else {
        const nextStage = gameState.currentStage + 1;
        setGameState(prev => prev ? { ...prev, currentStage: nextStage } : null);
        startStage(nextStage, genre);
      }
    }, 2000);
  };

  useEffect(() => {
    // Simulate WebSocket connection
    const connect = () => {
      setIsConnected(true);

      // Simulate initial game state
      setGameState({
        currentTurn: 1,
        phase: 'playing',
        votes: {},
        scenarios: [
          "A mysterious fog rolls into the tavern as you hear distant howling...",
          "The ancient map glows suddenly, revealing a hidden passage beneath your feet...",
          "A cloaked figure approaches your table with an urgent whisper..."
        ],
        storyProgress: [],
        currentStage: 1,
        maxStages: 5,
        isGameActive: true,
        pendingChoice: false,
        autoProgressAudio: true // Enable auto-progress for audio
      });

      // Start the first stage
      setTimeout(() => {
        startStage(1, genre);
      }, 1000);
    };

    const timer = setTimeout(connect, 1000);

    return () => {
      clearTimeout(timer);
      if (socketRef.current) {
        socketRef.current.close();
      }
      // Cleanup audio on unmount
      audioStory.stop();
      voicePlayback.stop();
      smartAudio.stop();
    };
  }, [roomCode, genre]);

  const startStage = (stageNumber: number, selectedGenre: Genre = genre) => {
    const stage = getStageData(stageNumber, selectedGenre);
    setCurrentStage(stage);

    // Set story text for audio narration
    setCurrentStoryText(stage.description);

    const stageMessage: Message = {
      id: `stage-${stageNumber}`,
      type: 'system',
      sender: 'Game Master',
      content: `Stage ${stageNumber}:\n${stage.description}\n\n${stage.choices.map((choice: any, index: number) =>
        `- Option ${index + 1}: ${choice.text} → DC ${choice.dc}`
      ).join('\n')}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, stageMessage]);
    setGameState(prev => prev ? { ...prev, pendingChoice: true } : null);
  };

  const makeChoice = (choiceId: number) => {
    if (!currentStage || !gameState) return;

    const choice = currentStage.choices.find((c: any) => c.id === choiceId);
    if (!choice) return;

    // Player choice message
    const choiceMessage: Message = {
      id: `choice-${Date.now()}`,
      type: 'action',
      sender: 'You',
      content: `You chose: ${choice.text}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, choiceMessage]);

    // Set game state to waiting for dice roll
    setGameState(prev => prev ? {
      ...prev,
      pendingChoice: false,
      waitingForDiceRoll: true,
      selectedChoice: { choiceId, dc: choice.dc }
    } : null);
  };

  const rollChoiceDice = () => {
    if (!gameState?.waitingForDiceRoll || !gameState.selectedChoice) return 0;

    const diceRoll = Math.floor(Math.random() * 20) + 1;
    const success = diceRoll >= gameState.selectedChoice.dc;

    // Dice roll message
    const diceMessage: Message = {
      id: `dice-${Date.now()}`,
      type: 'action',
      sender: 'You',
      content: `🎲 You rolled: ${diceRoll} (needed: ${gameState.selectedChoice.dc})`,
      timestamp: new Date(),
      diceRoll
    };

    setMessages(prev => [...prev, diceMessage]);

    // Game Master response
    setTimeout(() => {
      const resultMessage = generateStageResult(gameState.currentStage, gameState.selectedChoice!.choiceId, success, diceRoll);
      setMessages(prev => [...prev, resultMessage]);

      // Move to next stage or end game
      setTimeout(() => {
        if (gameState.currentStage >= gameState.maxStages || !success && Math.random() < 0.3) {
          endGame(success);
        } else {
          const nextStage = gameState.currentStage + 1;
          setGameState(prev => prev ? { ...prev, currentStage: nextStage } : null);
          startStage(nextStage, genre);
        }
      }, 2000);
    }, 1000);

    // Clear waiting state
    setGameState(prev => prev ? {
      ...prev,
      waitingForDiceRoll: false,
      selectedChoice: undefined
    } : null);

    return diceRoll;
  };

  const endGame = (victory: boolean) => {
    const endMessage: Message = {
      id: `end-${Date.now()}`,
      type: 'system',
      sender: 'Game Master',
      content: victory
        ? '🎉 Congratulations! You have successfully completed the adventure and escaped the mysterious mansion alive!'
        : '💀 Unfortunately, your adventure has come to an end. But don\'t worry, heroes always get another chance!',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, endMessage]);
    setGameState(prev => prev ? { ...prev, isGameActive: false, pendingChoice: false } : null);
    setCurrentStage(null);
  };

  const sendMessage = (content: string, diceRoll?: number) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: diceRoll ? 'action' : 'player',
      sender: 'You',
      content,
      timestamp: new Date(),
      diceRoll
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(content, diceRoll);
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };


  const rollDice = () => {
    if (gameState?.pendingChoice || gameState?.waitingForDiceRoll) {
      // If there's a pending choice or waiting for dice roll, don't allow free dice rolls
      return 0;
    }

    const roll = Math.floor(Math.random() * 20) + 1;
    const message = `🎲 You rolled a ${roll}!`;

    sendMessage(message, roll);
    return roll;
  };

  return {
    messages,
    gameState,
    currentStage,
    isConnected,
    sendMessage,
    rollDice,
    makeChoice,
    rollChoiceDice,
    audioStory, // Include TTS audio controls
    voicePlayback, // Include voice file playback controls
    smartAudio // Include smart audio controls (voice + TTS)
  };
};

const getStageData = (stageNumber: number, genre: Genre): StoryStage => {
  const genreStages: Record<Genre, Record<number, StoryStage>> = {
    "jenabkhan": {
      1: {
        stage: 1,
        description: "جنابخان وارد رستورانی قدیمی و تاریک می‌شود که بوی گوشت سوخته و عطر عرق مردانه در فضا پیچیده است. در گوشه‌ای از رستوران، صدای چینی‌های شکسته و نوشیدنی‌های تقطیر شده به گوش می‌رسد. مردی در گوشه‌نشسته و با نگرانی به اطراف نگاه می‌کند. او صاحب رستوران است، 'حاجی مهدی'. وقتی چشمش به جنابخان می‌افتد، ناگهان بدنش می‌لرزد. حاجی مهدی با دستان لرزان نزدیک می‌شود و در حالی که صدایش از ترس لرزان است، به جنابخان می‌گوید: \n\"جنابخان... تو... تو اونقدر قدرت داری که بتونی اینجا رو نجات بدی؟! در جنگل‌های اطراف هیولایی دو سر وجود داره که هر شب میاد و روستا رو به خاک و خون می‌کشه. من هر چی پول داشتم رو جمع کردم و آماده‌ام هر چی بخوای بهت بدم. فقط... فقط اون هیولا رو نابود کن!\"",
        choices: [
          { id: 1, text: 'با حاجی مهدی صحبت کن و اطلاعات بیشتری درباره هیولا به‌دست بیار.', dc: 12 },
          { id: 2, text: 'بدون هیچ توضیحی به دنبال هیولا برو و هیولا رو بکش!', dc: 14 },
          { id: 3, text: 'در مورد پیشنهادش فکر کن و تصمیم بگیر که چطور به کمکش بیای.', dc: 15 }
        ]
      },
      2: {
        stage: 2,
        description: "پس از صحبت با حاجی مهدی، جنابخان به دل جنگل تاریک می‌زند. شب است و صدای وزش باد به همراه زمزمه‌های عجیب از درختان به گوش می‌رسد. در میان مه سنگین، ناگهان دو چشم قرمز و درخشان از تاریکی به او خیره می‌شود. این همان هیولای دو سر است که با دندان‌های تیزش، آماده است تا شکار جدیدش را بیابد. بوی خون در هوا پراکنده است و جنابخان می‌داند که این جنگی مرگبار خواهد بود.",
        choices: [
          { id: 1, text: 'از جودو استفاده کن تا هیولا رو به زمین بندازی.', dc: 13 },
          { id: 2, text: 'لبو سهرآمیز رو فعال کن و هیولا رو فریب بده.', dc: 16 },
          { id: 3, text: 'از باقالی کشنده استفاده کن و حمله‌ای جادویی به هیولا بزنی.', dc: 14 }
        ]
      },
      3: {
        stage: 3,
        description: "جنابخان از لبو سهرآمیزش استفاده می‌کند و هیولا را به دام فریب می‌اندازد. هیولا که به شدت تحریک شده است، به طرف جنابخان حمله می‌کند. جنابخان که آماده‌ی مبارزه است، با حرکت‌های سریع جودو هیولا را به زمین می‌اندازد. اما هیولا با قدرتی وحشیانه از زمین بلند می‌شود و به جنابخان حمله می‌کند. در این لحظه، جنابخان از باقالی کشنده استفاده می‌کند و یک انفجار جادویی مهیب به هیولا می‌زند که در اثر آن هیولا به زمین می‌افتد.",
        choices: [
          { id: 1, text: 'هیولا رو نابود کن و به مردم گزارش بده که تهدید تمام شده.', dc: 13 },
          { id: 2, text: 'هیولا رو با جادوهای جودو به محلی دورتر بفرست تا نتونه حمله کنه.', dc: 14 },
          { id: 3, text: 'یک تله‌ی جادویی بذار و هیولا رو فریب بده تا خودش به دام بیفته.', dc: 15 }
        ]
      },
      4: {
        stage: 4,
        description: "در لحظات آخر، هیولا با قدرت جادویی که از دنیای دیگر به دست آورده، سعی می‌کند از دایره‌ی قدرت جنابخان فرار کند. او با استفاده از قدرت‌های جادویی‌اش سعی می‌کند جنابخان را به دام خود بکشد. جنابخان از لبو سهرآمیز استفاده می‌کند و هیولا را به موجودی بی‌دفاع تبدیل می‌کند. به همین ترتیب، هیولا از جهنم به دنیا بازمی‌گردد و جنابخان پیروز می‌شود.",
        choices: [
          { id: 1, text: 'هیولا رو نابود کن و از قدرت‌های جادویی‌ات استفاده کن تا تمامی اثرات شرارتش از بین بره.', dc: 17 },
          { id: 2, text: 'با استفاده از باقالی کشنده، یک جادو علیه هیولا بزن تا قدرتش از بین بره.', dc: 14 },
          { id: 3, text: 'برای جلوگیری از هرگونه بازگشتی، هیولا رو در جادویی که برای همیشه نگهش می‌داره حبس کن.', dc: 16 }
        ]
      },
      5: {
        stage: 5,
        description: "پس از شکست هیولا، جنابخان به شهر بازمی‌گردد. حاجی مهدی، در حالی که دست و پایش از ترس می‌لرزد، پول‌های زیادی را به جنابخان می‌دهد. جنابخان که می‌داند در این دنیای بی‌رحم هیچ چیزی به تنهایی ارزش ندارد، تمام پول‌هایی که گرفته بود را به مردم نیازمند شهر می‌دهد. او با نگاهی خیره به افق دور، تنها به سمت کوه‌های تاریک می‌رود و در دل خود می‌داند که هیچ‌گاه از مأموریتش دست نخواهد کشید.",
        choices: [
          { id: 1, text: 'پول‌ها را به مردم شهر بده و تصمیم بگیر که به ماجراجویی‌ات ادامه بدی.', dc: 14 },
          { id: 2, text: 'پول‌ها را برای خود نگه دار و به سفر جدیدی برو.', dc: 13 },
          { id: 3, text: 'پول‌ها را به فقرا بده و در آرامش در این سرزمین زندگی کن.', dc: 15 }
        ]
      }
    },
    fantasy: {
      1: {
        stage: 1,
        description: 'A cold wind blows through the iron gates of the castle, and the sound of old chains echoes in the air. You step into the great hall of the magical castle, its walls covered with mysterious paintings and magical inscriptions. Blue flames from torches cast a dazzling light on ancient stones. At the end of the hall, two paths lie before you: a spiral staircase leading to the tall wizard\'s tower, and a heavy door leading to the dark dungeons full of secrets. The air is thick with magic, and you feel that your choice will determine the fate of your adventure.',
        choices: [
          { id: 1, text: 'Climb the spiral stairs to the wizard\'s tower and face magical mysteries', dc: 12 },
          { id: 2, text: 'Pass through the heavy door and enter the dangerous dungeons full of dragons', dc: 14 }
        ]
      },
      2: {
        stage: 2,
        description: 'Suddenly, purple smoke swirls in the air, and from it emerges an old wizard with a long silver beard and a glowing staff. His blue eyes shine like stars, and a mysterious smile plays on his lips. "Brave young one, to continue your path, you must solve my ancient riddle or demonstrate your magical power. But know that every choice has consequences, and there is no turning back." His voice is like the whisper of wind through autumn leaves. In his hands, you see an ancient book and a crystal goblet filled with a glowing liquid.',
        choices: [
          { id: 1, text: 'Raise your hands and chant a powerful breaking spell to demonstrate your magical power', dc: 13 },
          { id: 2, text: 'Look at the ancient book and use your intellect and knowledge to solve the complex riddle', dc: 11 }
        ]
      },
      3: {
        stage: 3,
        description: 'After passing the wizard\'s test, you find yourself in a magical garden where the trees are made of gold and silver. Colorful fruits hang from the branches, each with different powers. In the center of the garden, a crystal fountain flows with water that shines like diamonds. But suddenly, the ground beneath your feet trembles, and the roar of a massive dragon echoes from the sky. A red dragon with fiery eyes descends and blocks the exit from the garden. "Who dares to enter my realm?" its voice thunders like lightning.',
        choices: [
          { id: 1, text: 'Bravely step towards the dragon and try to negotiate with it', dc: 15 },
          { id: 2, text: 'Use the magical fruits from the trees to gain power', dc: 12 },
          { id: 3, text: 'Run towards the crystal fountain and drink from its magical water', dc: 13 }
        ]
      },
      4: {
        stage: 4,
        description: 'The dragon looks at your courage in amazement and suddenly transforms into a beautiful woman with golden hair. "I am the queen of this magical realm and was trapped in the form of a dragon. You freed me with your courage and wisdom." She extends her hand towards you, and in her palm lie three glowing gems: a red ruby of power, a green emerald of wisdom, and a blue diamond of protection. "Choose one of these gems, for you will need it in the final battle against the evil wizard who has taken over the castle." A gentle breeze blows, and the golden leaves of the trees dance slowly.',
        choices: [
          { id: 1, text: 'Choose the red ruby of power to have more physical strength in battle', dc: 11 },
          { id: 2, text: 'Select the green emerald of wisdom to be able to cast more complex spells', dc: 12 },
          { id: 3, text: 'Choose the blue diamond of protection to be safe from magical attacks', dc: 10 }
        ]
      },
      5: {
        stage: 5,
        description: 'With the chosen gem in hand, you enter the throne room of the castle. A vast room with a high ceiling where stars shine. At the end of the room, the evil wizard sits on a throne of black stone. His eyes are red like hellfire, and black smoke rises from his hands. "So you are the one who dared to infiltrate my castle! But now it\'s time for your end!" He raises his black staff and sends a storm of dark lightning towards you. This is the final battle, and the fate of the entire realm depends on your choice. The gem you chose glows in your hand, and you are ready for the final battle.',
        choices: [
          { id: 1, text: 'Attack the wizard directly and use the power of your gem', dc: 16 },
          { id: 2, text: 'First cast a protective spell and then attack with strategy', dc: 14 },
          { id: 3, text: 'Try to convince the wizard with words to give up evil', dc: 18 }
        ]
      }
    },
    historical: {
      1: {
        stage: 1,
        description: 'The sun is setting and its golden light shines on the turquoise domes of Isfahan. You are a rider carrying an important and secret message from the army commander that must reach Shah Abbas as quickly as possible. Ottoman enemies are moving at the borders, and this message could change the fate of the war. Your horse is tired and night is approaching. Before you lie two paths: the main road that passes through cities and caravanserais but may have enemy spies lying in wait, or the mountain path that is dangerous but more hidden. The sound of castle guards\' trumpets can be heard in the distance.',
        choices: [
          { id: 1, text: 'Take the main road through the cities to arrive faster', dc: 10 },
          { id: 2, text: 'Choose the hidden mountain path to stay away from enemy eyes', dc: 13 }
        ]
      },
      2: {
        stage: 2,
        description: 'The sound of horse hooves comes from behind you, and when you look back, five Ottoman riders in black clothes with drawn swords are chasing you. They are shouting war cries and getting faster. Your horse is panting and sweating. Ahead, you see a stone bridge over a deep river, and to the right, a dense forest where you can hide. The moon is hidden behind clouds, and darkness has come to your aid. The message is safe in your pocket, but you must make a quick decision.',
        choices: [
          { id: 1, text: 'Stop your horse and prepare to fight with your sword', dc: 14 },
          { id: 2, text: 'Run towards the forest and hide among the trees', dc: 12 },
          { id: 3, text: 'Cross the bridge at speed and hope your horse can endure', dc: 13 }
        ]
      },
      3: {
        stage: 3,
        description: 'After escaping from the enemies, you find yourself near the king\'s palace. But the gate guards are suspicious of you because your clothes are dirty and torn. They have pointed their spears at you, and one of them says in an Isfahani accent: "Who are you and what do you want? Why have you come to the palace at this hour of night?" You know the message in your hand is very important, but you must gain the guards\' trust. In your pocket is the army commander\'s seal that can prove your identity, but they might not recognize it.',
        choices: [
          { id: 1, text: 'Show the army commander\'s seal and prove your identity', dc: 11 },
          { id: 2, text: 'Convince them with respectful and polite words', dc: 13 },
          { id: 3, text: 'Say you have an urgent message for the king and no time to explain', dc: 15 }
        ]
      }
    },
    mystery: {
      1: {
        stage: 1,
        description: 'Heavy rain is falling and the sound of thunder fills the night air of London. You are a famous detective invited to the old Victorian mansion of the Blackwood family to solve the mysterious murder of Lord Charles Blackwood. His body was found in the library, and there are no signs of forced entry into the mansion. An old servant with worried eyes guides you inside. In the main hall, family members have gathered: the lord\'s young wife, his jealous brother, and his stepdaughter, all looking suspicious. Candles provide dim light to the space, and strange shadows dance on the walls.',
        choices: [
          { id: 1, text: 'Go directly to the library and carefully examine the crime scene', dc: 11 },
          { id: 2, text: 'First talk to the family members and interrogate them', dc: 13 }
        ]
      },
      2: {
        stage: 2,
        description: 'While examining the library, you found a hidden letter behind one of the books containing a threat against Lord Blackwood. But as you read the letter, you hear footsteps in the hallway approaching the library. The candles go out one by one, and the space becomes darker. You feel someone is watching you. In the corner of the room, you found a hidden door that leads to a secret corridor. The footsteps are getting closer, and you can see a shadow under the door. Your heart is beating fast, and you must decide quickly.',
        choices: [
          { id: 1, text: 'Stay in your place and bravely face whoever enters', dc: 12 },
          { id: 2, text: 'Use the hidden door and escape to the secret corridor', dc: 10 },
          { id: 3, text: 'Hide the letter and pretend you haven\'t found anything important', dc: 14 }
        ]
      }
    },
    horror: {
      1: {
        stage: 1,
        description: 'It\'s a dark and moonless night, and you stand in front of an abandoned house that has been empty for years. A cold wind blows, and dry leaves swirl in the yard. The broken windows of the house stare at you like empty eyes. Strange sounds come from inside the house: whispers that seem to come from another world, footsteps on the upper floor, and sometimes a scream that freezes the blood in your veins. In your hand, you have a dim flashlight, and you know you must enter to discover the secret of this house. At the entrance, two paths lie before you: stairs leading to the dark basement, or stairs going to the upper floor where the sounds are heard more.',
        choices: [
          { id: 1, text: 'Bravely go to the dark and damp basement', dc: 13 },
          { id: 2, text: 'Go up the stairs to the upper floor where the sounds come from', dc: 15 },
          { id: 3, text: 'Run away from the house in fear and go to a safe place', dc: 10 }
        ]
      },
      2: {
        stage: 2,
        description: 'Suddenly, the air becomes cold and your breath turns to vapor. Your flashlight flickers several times and then goes out completely. In absolute darkness, a white and dazzling light appears, and from it emerges the figure of a woman in white clothes. Her face is pale and her eyes are black and deep. Her long hair floats in the air, and her voice is like the whisper of wind in a cemetery: "Why have you come to my house? This is not a place for the living!" Her hands reach towards you, and you feel your energy draining. The room starts spinning, and objects move by themselves. You must act quickly, or your soul will be trapped in this house forever.',
        choices: [
          { id: 1, text: 'Bravely step towards the spirit and confront it', dc: 15 },
          { id: 2, text: 'Chant a protection prayer and hope it drives her away', dc: 12 },
          { id: 3, text: 'Try to talk to the spirit and understand the reason for her anger', dc: 14 }
        ]
      }
    },
    comedy: {
      1: {
        stage: 1,
        description: 'You have entered a colorful and strange circus where everything is upside down! Elephants walk on tightropes, clowns are serious and grumpy, and lions are reading books! The circus director, wearing a tall hat, says to you with a wide smile: "Welcome to the Upside-Down Circus! Here everything is strange, and you must adapt to our rules!" Around you, clowns in colorful clothes are having serious philosophical discussions, and monkeys are watching television! Happy music is playing, but everyone dances to the reverse rhythm. The circus director says: "To become a member of our circus, you must pass a test!"',
        choices: [
          { id: 1, text: 'Dance with the upside-down philosophical clowns and be happy', dc: 8 },
          { id: 2, text: 'Try to be serious like the others and talk about deep topics', dc: 12 },
          { id: 3, text: 'Sit with the monkeys and watch television', dc: 9 }
        ]
      },
      2: {
        stage: 2,
        description: 'Suddenly, the circus elephants started flying! They went to the sky with colorful balloons and are spinning in the air! One of the elephants shouts: "We are free! We no longer want to walk on the ground!" The circus director waves his hands worriedly and says: "Oh no! If the elephants don\'t return, our circus will be closed!" Around, the audience is cheering and laughing, thinking this is part of the show. The clowns also started crying (which in this upside-down circus, crying means happiness!). You must do something to make the elephants return to the ground.',
        choices: [
          { id: 1, text: 'Use a toy bow and arrow to pop their balloons', dc: 10 },
          { id: 2, text: 'Sing a sad song to make them happy and come down', dc: 9 },
          { id: 3, text: 'Shout that free ice cream is waiting for them below', dc: 7 }
        ]
      }
    },
    scifi: {
      1: {
        stage: 1,
        description: 'It\'s the year 2385, and you are the captain of the spaceship "Star of Hope" traveling to planet Kepler-442b. Suddenly, danger alarms sound and red lights fill the cabin. The ship\'s main computer announces in a mechanical voice: "Warning! Vital systems have malfunctioned. Main engine inactive. Life support system shutting down." From the cabin window, you see the blackness of space and distant stars. The ship\'s oxygen is running out, and you must decide quickly. At the control console, two options lie before you: manual repair of the systems, which is dangerous, or sending an emergency message to the nearest space station.',
        choices: [
          { id: 1, text: 'Put on a spacesuit and go outside the ship to repair the systems', dc: 13 },
          { id: 2, text: 'Send an emergency message to Alpha Centauri space station', dc: 11 },
          { id: 3, text: 'Try to communicate with the ship\'s auxiliary computer', dc: 12 }
        ]
      },
      2: {
        stage: 2,
        description: 'Suddenly, the ship shakes violently and a strange sound comes from outside. When you look at the radar screen, three unknown objects are approaching the ship. They have a strange shape, like giant jellyfish floating in space and emitting purple light. Suddenly, a telepathic voice echoes in your mind: "We are the Zakorians. Your ship has entered our territory. Surrender or be destroyed." The ship shakes again, and the ship\'s protective shields are weakening. At the weapons console, defensive lasers are ready to fire, but these creatures might be peaceful.',
        choices: [
          { id: 1, text: 'Activate defensive lasers and fight the alien creatures', dc: 14 },
          { id: 2, text: 'Try to establish peaceful communication with them through telepathy', dc: 12 },
          { id: 3, text: 'Turn on escape engines and try to get away from them', dc: 15 }
        ]
      }
    }
  };
  
  const stages = genreStages[genre] || genreStages.fantasy;
  return stages[stageNumber] || stages[1];
};

const generateStageResult = (stage: number, choiceId: number, success: boolean, diceRoll: number): Message => {
  const results: Record<string, Record<number, { success: string; failure: string }>> = {
    '1': {
      1: {
        success: `🎲 ${diceRoll} - Success! You climbed the spiral stairs with firm steps. The old wizard welcomed you with a smile and said: "Brave young one, you are worthy of magical knowledge." A golden light enveloped you, and you felt new power flowing through your being.`,
        failure: `🎲 ${diceRoll} - Failure! The stairs suddenly started moving and you fell. A demonic laugh echoed in the air: "You're not ready yet!" But fortunately, you survived and have another chance.`
      },
      2: {
        success: `🎲 ${diceRoll} - Success! You bravely entered the dungeon and saw the sleeping dragon. He respectfully raised his head and said: "I've been waiting for someone like you for years. Take this treasure." He gave you a chest full of glowing jewels.`,
        failure: `🎲 ${diceRoll} - Failure! The dragon woke up and became angry. Fire came out of his mouth, but fortunately, you escaped quickly. "Come back when you're braver!" his voice echoed in the tunnel.`
      }
    },
    '2': {
      1: {
        success: `🎲 ${diceRoll} - Excellent! You chanted a powerful spell that amazed the wizard. "You truly have talent!" He gave you an ancient magical book. "This book will help you in future adventures."`,
        failure: `🎲 ${diceRoll} - Oops! Your spell didn't work, and instead, your hair turned purple! The wizard laughed: "Don't worry, you'll get better with practice. But for now, you'll have to continue with these purple hair!"`
      },
      2: {
        success: `🎲 ${diceRoll} - Clever! You solved the complex riddle. The wizard said with admiration: "Your mind is as sharp as a blade!" He gave you a map of the castle that shows secret passages.`,
        failure: `🎲 ${diceRoll} - Unfortunately! You gave the wrong answer and the wizard became upset. "You need to think more!" He sent you to the waiting room to think again.`
      }
    }
  };
  
  const stageResults = results[stage.toString()];
  const result = stageResults?.[choiceId] || {
    success: `🎲 ${diceRoll} - Success! It was a good choice and you're closer to your goal. The path ahead has become clearer.`,
    failure: `🎲 ${diceRoll} - Failure! Unfortunately, things didn't go according to plan, but there's still hope. Learn from this experience.`
  };
  
  return {
    id: `result-${Date.now()}`,
    type: 'ai',
    sender: 'Game Master',
    content: success ? result.success : result.failure,
    timestamp: new Date()
  };
};

const generateAIResponse = (_playerAction: string, diceRoll?: number): Message => {
  const responses = [
    "The shadows seem to whisper secrets as you move forward cautiously...",
    "Your bold action has caught the attention of creatures around you who look at you with curiosity...",
    "The ancient magic in the air responds to your presence and creates unexpected waves...",
    "A roar from afar echoes in the room as your actions set events in motion..."
  ];

  let content = responses[Math.floor(Math.random() * responses.length)];
  
  if (diceRoll) {
    if (diceRoll >= 15) {
      content += " Your exceptional skill guides you toward success!";
    } else if (diceRoll >= 10) {
      content += " With effort, you succeeded in reaching your goal.";
    } else {
      content += " Despite your efforts, things didn't go as you had planned...";
    }
  }

  content += " What do you do now?";

  return {
    id: Date.now().toString() + '_ai',
    type: 'ai',
    sender: 'Game Master',
    content,
    timestamp: new Date()
  };
};