# D&D Bolt - Modern Tabletop Adventures

A modern, AI-powered D&D tabletop game built with React, TypeScript, and cutting-edge web technologies. Experience immersive storytelling with real-time multiplayer, character creation, inventory management, and achievement systems.

## ✨ Features

### 🎮 Core Gameplay
- **AI-Powered Storytelling**: Dynamic, context-aware narratives that adapt to player choices
- **Real-time Multiplayer**: Play with friends in live sessions with instant updates
- **Modern Dice System**: Beautiful, animated dice with critical hit/miss effects
- **Multiple Genres**: Fantasy, Sci-Fi, Horror, Mystery, Comedy, and Historical settings

### 🧙‍♂️ Character System
- **Character Creation**: Comprehensive character builder with classes, races, and stats
- **Inventory Management**: Full item system with rarity, effects, and equipment slots
- **Achievement System**: Track progress with unlockable achievements and rewards
- **Character Progression**: Level up and gain experience through adventures

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful, modern interface with glass-like effects
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Themes**: Multiple theme options with system preference detection
- **Smooth Animations**: Framer Motion powered animations and transitions
- **PWA Support**: Install as a native app on any device

### 🔧 Technical Features
- **TypeScript**: Full type safety and excellent developer experience
- **State Management**: Zustand for efficient, modern state management
- **Real-time Updates**: WebSocket integration for live multiplayer
- **Offline Support**: PWA capabilities for offline gameplay
- **Performance Optimized**: React 18+ with modern optimization techniques

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/dnd-bolt.git
   cd dnd-bolt
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to start playing!

### Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory, ready for deployment.

## 🎯 How to Play

### Quick Start
1. **Create a Room**: Start a new adventure as the host
2. **Join a Room**: Enter a room code to join friends
3. **Create Character**: Build your hero with the character creator
4. **Start Adventure**: Begin your AI-powered storytelling journey

### Character Creation
- Choose from multiple classes (Fighter, Wizard, Rogue, Cleric)
- Select your race (Human, Elf, Dwarf, Halfling)
- Allocate ability scores (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma)
- Customize appearance and backstory

### Gameplay
- Make choices that affect the story
- Roll dice for skill checks and combat
- Manage your inventory and equipment
- Unlock achievements as you progress
- Experience dynamic, AI-generated narratives

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React
- **PWA**: Vite PWA Plugin
- **Backend**: Supabase (WebSocket integration)
- **Build Tool**: Vite with modern optimizations

## 📱 PWA Features

D&D Bolt is a Progressive Web App that can be installed on any device:

- **Install Prompt**: Automatic installation prompts on supported browsers
- **Offline Support**: Play without internet connection
- **App-like Experience**: Full-screen, native app feel
- **Push Notifications**: Get notified of game updates and invitations
- **Background Sync**: Sync game state when connection is restored

## 🎨 Theming

The app supports multiple themes:

- **Dark Theme**: Default, optimized for gaming
- **Light Theme**: Clean, bright interface
- **System Theme**: Automatically follows OS preference

Switch themes using the theme toggle in the navigation bar.

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── CharacterCreation.tsx
│   ├── GamePage.tsx
│   ├── Inventory.tsx
│   ├── Achievements.tsx
│   └── ...
├── contexts/           # React contexts
│   └── ThemeContext.tsx
├── hooks/              # Custom React hooks
├── store/              # Zustand store
├── types/              # TypeScript type definitions
└── ...
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **D&D Community**: For inspiration and feedback
- **Open Source Libraries**: For the amazing tools that make this possible
- **Contributors**: Thank you to all who have contributed to this project

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/dnd-bolt/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/dnd-bolt/discussions)
- **Email**: support@dndbolt.com

## 🎉 What's Next

- [ ] Voice chat integration
- [ ] 3D dice animations
- [ ] Campaign management
- [ ] Character import/export
- [ ] Mobile app versions
- [ ] Advanced AI features

---

**Ready to embark on your next adventure?** 🗡️✨

Start playing D&D Bolt today and experience the future of tabletop gaming!
