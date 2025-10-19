import React, { useState } from 'react';
import { Sword, Zap, Heart, BrainCircuit, Eye, Star, User, ArrowRight, Dice6, CheckCircle2 } from 'lucide-react';
import { Character, CharacterClass, CharacterRace, CharacterStats } from '../types/game';
import { useLanguage } from '../hooks/useLanguage';

interface CharacterCreationProps {
  onCharacterCreate: (character: Character) => void;
  onSkip: () => void;
}

const characterClasses: CharacterClass[] = [
  {
    name: 'Fighter',
    description: 'A master of weapons and armor, excelling in combat',
    hitDie: 10,
    primaryAbility: ['strength', 'constitution'],
    savingThrowProficiencies: ['strength', 'constitution'],
    skillProficiencies: ['athletics', 'intimidation'],
    features: ['Fighting Style', 'Second Wind', 'Action Surge']
  },
  {
    name: 'Wizard',
    description: 'A scholar of arcane magic, wielding powerful spells',
    hitDie: 6,
    primaryAbility: ['intelligence'],
    savingThrowProficiencies: ['intelligence', 'wisdom'],
    skillProficiencies: ['arcana', 'history', 'investigation'],
    features: ['Spellcasting', 'Arcane Recovery', 'Ritual Casting']
  },
  {
    name: 'Rogue',
    description: 'A stealthy and cunning adventurer, master of skills',
    hitDie: 8,
    primaryAbility: ['dexterity'],
    savingThrowProficiencies: ['dexterity', 'intelligence'],
    skillProficiencies: ['acrobatics', 'deception', 'stealth'],
    features: ['Sneak Attack', 'Thieves\' Cant', 'Cunning Action']
  },
  {
    name: 'Cleric',
    description: 'A divine spellcaster, channeling the power of the gods',
    hitDie: 8,
    primaryAbility: ['wisdom'],
    savingThrowProficiencies: ['wisdom', 'charisma'],
    skillProficiencies: ['history', 'insight', 'medicine'],
    features: ['Divine Domain', 'Channel Divinity', 'Divine Intervention']
  }
];

const characterRaces: CharacterRace[] = [
  {
    name: 'Human',
    description: 'Versatile and ambitious, humans are the most adaptable race',
    abilityScoreIncrease: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    size: 'Medium',
    speed: 30,
    traits: ['Extra Language', 'Extra Skill Proficiency'],
    languages: ['Common', 'One additional language']
  },
  {
    name: 'Elf',
    description: 'Graceful and long-lived, elves are attuned to magic and nature',
    abilityScoreIncrease: { dexterity: 2 },
    size: 'Medium',
    speed: 30,
    traits: ['Darkvision', 'Fey Ancestry', 'Trance'],
    languages: ['Common', 'Elvish']
  },
  {
    name: 'Dwarf',
    description: 'Hardy and traditional, dwarves are known for their craftsmanship',
    abilityScoreIncrease: { constitution: 2 },
    size: 'Medium',
    speed: 25,
    traits: ['Darkvision', 'Dwarven Resilience', 'Stonecunning'],
    languages: ['Common', 'Dwarvish']
  },
  {
    name: 'Halfling',
    description: 'Small but brave, halflings are known for their luck and courage',
    abilityScoreIncrease: { dexterity: 2 },
    size: 'Small',
    speed: 25,
    traits: ['Lucky', 'Brave', 'Halfling Nimbleness'],
    languages: ['Common', 'Halfling']
  }
];

const statIcons = {
  strength: Sword,
  dexterity: Zap,
  constitution: Heart,
  intelligence: BrainCircuit,
  wisdom: Eye,
  charisma: Star
};

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCharacterCreate, onSkip }) => {
  const [step, setStep] = useState(1);
  const { t } = useLanguage();
  const [character, setCharacter] = useState<Partial<Character>>({
    name: '',
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      hitPoints: 10,
      maxHitPoints: 10,
      armorClass: 10,
      speed: 30
    },
    inventory: [],
    spells: [],
    equipment: { accessories: [] },
    backstory: '',
    avatar: '🧙‍♂️'
  });

  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [selectedRace, setSelectedRace] = useState<CharacterRace | null>(null);

  const handleStatChange = (stat: keyof CharacterStats, value: number) => {
    if (stat === 'strength' || stat === 'dexterity' || stat === 'constitution' || 
        stat === 'intelligence' || stat === 'wisdom' || stat === 'charisma') {
      setCharacter(prev => ({
        ...prev,
        stats: {
          ...prev.stats!,
          [stat]: Math.max(8, Math.min(20, value))
        }
      }));
    }
  };

  const handleClassSelect = (charClass: CharacterClass) => {
    setSelectedClass(charClass);
    setCharacter(prev => ({
      ...prev,
      class: charClass
    }));
  };

  const handleRaceSelect = (race: CharacterRace) => {
    setSelectedRace(race);
    setCharacter(prev => ({
      ...prev,
      race: race
    }));
  };

  const handleCreateCharacter = () => {
    if (character.name && selectedClass && selectedRace) {
      const finalCharacter: Character = {
        id: Date.now().toString(),
        name: character.name,
        class: selectedClass,
        race: selectedRace,
        stats: character.stats!,
        inventory: character.inventory!,
        spells: character.spells!,
        equipment: character.equipment!,
        backstory: character.backstory!,
        avatar: character.avatar!
      };
      onCharacterCreate(finalCharacter);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <h2 className="text-lg sm:text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl font-bold text-ink mb-6 sm:mb-6 sm:mb-8">Choose Your Class</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4 sm:gap-6 lg:gap-4 sm:p-6 lg:p-8">
              {characterClasses.map((charClass) => (
                <button
                  key={charClass.name}
                  onClick={() => handleClassSelect(charClass)}
                  className={`group glass-card p-4 sm:p-6 lg:p-8 text-left hover:scale-105 transition-all duration-300 relative overflow-hidden ${
                    selectedClass?.name === charClass.name 
                      ? 'border-4 border-purple-500 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 shadow-xl shadow-purple-500/50 ring-2 ring-purple-400' 
                      : 'border-2 border-transparent hover:border-purple-300/30'
                  }`}
                >
                  {/* Selected indicator */}
                  {selectedClass?.name === charClass.name && (
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-purple-500 rounded-full p-1 sm:p-2 animate-bounce">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      selectedClass?.name === charClass.name
                        ? 'bg-gradient-to-br from-purple-500/50 to-indigo-500/50 ring-2 ring-purple-400'
                        : 'bg-gradient-to-br from-amber-500/30 to-yellow-500/30'
                    }`}>
                      <Sword className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${
                        selectedClass?.name === charClass.name ? 'text-white' : 'text-ink-muted'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                        selectedClass?.name === charClass.name ? 'text-purple-400' : 'text-ink'
                      }`}>{charClass.name}</h3>
                      <p className={`text-sm transition-colors duration-300 ${
                        selectedClass?.name === charClass.name ? 'text-purple-300 font-semibold' : 'text-purple-600'
                      }`}>Hit Die: d{charClass.hitDie}</p>
                    </div>
                  </div>
                  <p className="text-ink mb-4">{charClass.description}</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-semibold text-purple-600">Primary Abilities: </span>
                      <span className="text-sm text-ink-muted">{charClass.primaryAbility.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-purple-600">Key Features: </span>
                      <span className="text-sm text-ink-muted">{charClass.features.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-ink mb-6 sm:mb-8">Choose Your Race</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:p-6 lg:p-8">
              {characterRaces.map((race) => (
                <button
                  key={race.name}
                  onClick={() => handleRaceSelect(race)}
                  className={`group glass-card p-4 sm:p-6 lg:p-8 text-left hover:scale-105 transition-all duration-300 relative overflow-hidden ${
                    selectedRace?.name === race.name 
                      ? 'border-4 border-cyan-500 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 shadow-xl shadow-cyan-500/50 ring-2 ring-cyan-400' 
                      : 'border-2 border-transparent hover:border-cyan-300/30'
                  }`}
                >
                  {/* Selected indicator */}
                  {selectedRace?.name === race.name && (
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-cyan-500 rounded-full p-1 sm:p-2 animate-bounce">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      selectedRace?.name === race.name
                        ? 'bg-gradient-to-br from-cyan-500/50 to-blue-500/50 ring-2 ring-cyan-400'
                        : 'bg-gradient-to-br from-amber-500/30 to-yellow-500/30'
                    }`}>
                      <User className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${
                        selectedRace?.name === race.name ? 'text-white' : 'text-ink-muted'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                        selectedRace?.name === race.name ? 'text-cyan-400' : 'text-ink'
                      }`}>{race.name}</h3>
                      <p className={`text-sm transition-colors duration-300 ${
                        selectedRace?.name === race.name ? 'text-cyan-300 font-semibold' : 'text-cyan-600'
                      }`}>Size: {race.size} | Speed: {race.speed}ft</p>
                    </div>
                  </div>
                  <p className="text-ink mb-4">{race.description}</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-semibold text-cyan-600">Ability Bonuses: </span>
                      <span className="text-sm text-ink-muted">
                        {Object.entries(race.abilityScoreIncrease)
                          .filter(([_, value]) => value > 0)
                          .map(([stat, value]) => `${stat} +${value}`)
                          .join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-cyan-600">Traits: </span>
                      <span className="text-sm text-ink-muted">{race.traits.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-ink mb-6 sm:mb-8">Allocate Your Stats</h2>
            <p className="text-ink mb-10">Distribute points among your character's abilities (8-20 range)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:p-6 lg:p-8">
              {Object.entries(character.stats!).map(([stat, value]) => {
                if (['hitPoints', 'maxHitPoints', 'armorClass', 'speed'].includes(stat)) return null;
                const Icon = statIcons[stat as keyof typeof statIcons];
                return (
                  <div key={stat} className="glass-card p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-xl flex items-center justify-center">
                        <Icon className="h-5 w-5 text-ink-muted" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-ink capitalize">{stat}</h3>
                        <p className="text-sm text-ink-muted">Modifier: {Math.floor((value - 10) / 2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleStatChange(stat as keyof CharacterStats, value - 1)}
                        disabled={value <= 8}
                        className="w-8 h-8 bg-red-600/20 hover:bg-red-600/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-ink font-bold"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-ink w-12 text-center">{value}</span>
                      <button
                        onClick={() => handleStatChange(stat as keyof CharacterStats, value + 1)}
                        disabled={value >= 20}
                        className="w-8 h-8 bg-amber-600/20 hover:bg-amber-600/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-ink font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-ink mb-6 sm:mb-8">Character Details</h2>
            <div className="max-w-2xl mx-auto space-y-8">
              <div>
                <label className="block text-sm font-medium text-purple-600 mb-2">Character Name</label>
                <input
                  type="text"
                  value={character.name}
                  onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-amber-50/80 dark:bg-parchment/20 border border-purple-500/30 dark:border-purple-500/50 rounded-xl text-ink dark:text-black placeholder-ink-muted dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-base backdrop-blur-sm"
                  placeholder="Enter your character's name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-600 mb-2">Avatar</label>
                <div className="flex space-x-4 justify-center">
                  {['🧙‍♂️', '⚔️', '🏹', '🛡️', '🔮', '🗡️'].map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setCharacter(prev => ({ ...prev, avatar }))}
                      className={`text-4xl p-3 rounded-xl transition-all duration-300 ${
                        character.avatar === avatar 
                          ? 'bg-purple-600/30 border-2 border-purple-500 scale-110' 
                          : 'bg-white/5 hover:bg-white/10 hover:scale-105'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-600 mb-2">Backstory</label>
                <textarea
                  value={character.backstory}
                  onChange={(e) => setCharacter(prev => ({ ...prev, backstory: e.target.value }))}
                  className="w-full px-4 py-3 bg-amber-50/80 dark:bg-parchment/20 border border-purple-500/30 dark:border-purple-500/50 rounded-xl text-ink dark:text-black placeholder-ink-muted dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-base backdrop-blur-sm resize-none"
                  rows={4}
                  placeholder="Tell us about your character's background..."
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto glass-card p-4 sm:p-6 lg:p-10 shadow-2xl">
        <div className="text-center mb-6 sm:mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-xl sm:text-2xl lg:text-3xl lg:text-4xl font-bold gradient-text mb-2 sm:mb-4">{t('character.create')}</h1>
          <p className="text-base sm:text-lg lg:text-lg sm:text-xl text-ink">{t('character.buildHero')}</p>
        </div>

      {/* Progress Bar */}
      <div className="mb-6 sm:mb-6 sm:mb-8 lg:mb-10">
        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                step >= stepNum 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                  : 'bg-gray-600 text-gray-400'
              }`}>
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 ${
                  step > stepNum ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {renderStep()}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8 lg:mt-10">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gray-600/20 hover:bg-gray-600/40 disabled:opacity-50 disabled:cursor-not-allowed text-ink rounded-xl transition-all duration-300 text-sm sm:text-base"
        >
          Previous
        </button>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
          <button
            onClick={onSkip}
            className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gray-600/20 hover:bg-gray-600/40 text-ink rounded-xl transition-all duration-300 text-sm sm:text-base"
          >
            Skip
          </button>
          
          {step === 4 ? (
            <button
              onClick={handleCreateCharacter}
              disabled={!character.name || !selectedClass || !selectedRace}
              className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-ink rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 text-sm sm:text-base"
            >
              <Dice6 className="h-5 w-5" />
              <span>Create Character</span>
            </button>
          ) : (
            <button
              onClick={() => setStep(Math.min(4, step + 1))}
              disabled={step === 1 && !selectedClass || step === 2 && !selectedRace}
              className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-ink rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 text-sm sm:text-base"
            >
              <span>Next</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
