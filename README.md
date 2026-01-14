# 🎮 PokeSwipe - Gotta Catch Your Love!

A **Tinder-style Pokémon swiping app** built with React Native. Swipe through random Pokémon, like your favorites, and build your dream team!

![React Native](https://img.shields.io/badge/React_Native-0.83.1-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![PokeAPI](https://img.shields.io/badge/API-PokeAPI-red)

## ✨ Features

### Core Features
- 🎴 **Tinder-style Swiping** - Drag cards left/right or use buttons
- 🔄 **Random Pokémon** - Fetched from [PokeAPI](https://pokeapi.co/)
- ❤️ **Like/Dislike System** - Build your favorite team
- 📱 **Responsive Design** - Works on all screen sizes
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 💾 **Persistent Storage** - Your likes are saved locally

### Creative Additions
- 🎨 **Type-based Styling** - Card accents match Pokémon type colors
- 📳 **Haptic Feedback** - Vibration on like/dislike
- 🏷️ **Pokémon ID Badges** - Shows #001, #025, etc.
- ✨ **Live Overlays** - "LIKE"/"NOPE" appears while dragging
- 🃏 **Stacked Cards Effect** - Visual deck of cards
- 🖼️ **Beautiful Grid** - Liked Pokémon collection with type colors

## 📸 Screenshots

| Welcome | Swipe | Liked Collection |
|---------|-------|------------------|
| Instructions & Start | Drag to Like/Dislike | Your Dream Team |

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/developer-reactnative/PokeSwipeRN.git
   cd PokeSwipeRN
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS pods**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run the app**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## 📁 Project Structure

```
PokeSwipeRN/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── PokemonCard.tsx
│   │   ├── TypeBadge.tsx
│   │   ├── AbilityBadge.tsx
│   │   └── LikedPokemonCard.tsx
│   │
│   ├── screens/             # App screens
│   │   ├── WelcomeScreen.tsx
│   │   ├── SwipeScreen.tsx
│   │   └── LikedScreen.tsx
│   │
│   ├── context/             # State management
│   │   ├── PokemonContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── services/            # API calls
│   │   └── pokeApi.ts
│   │
│   ├── types/               # TypeScript types
│   │   └── pokemon.ts
│   │
│   ├── utils/               # Utility functions
│   │   └── typeColors.ts
│   │
│   └── navigation/          # React Navigation
│       └── AppNavigator.tsx
│
├── App.tsx                  # Entry point
└── package.json
```

## 🛠️ Tech Stack

- **React Native** 0.83.1
- **TypeScript** 5.8
- **React Navigation** - Native Stack Navigator
- **AsyncStorage** - Persistent storage
- **PokeAPI** - Pokémon data source

## 🎨 Pokémon Type Colors

The app features 18 unique type colors for visual styling:

| Type | Color | Type | Color |
|------|-------|------|-------|
| 🔥 Fire | #F08030 | 💧 Water | #6890F0 |
| 🌿 Grass | #78C850 | ⚡ Electric | #F8D030 |
| ❄️ Ice | #98D8D8 | 👊 Fighting | #C03028 |
| ☠️ Poison | #A040A0 | 🌍 Ground | #E0C068 |
| 🦅 Flying | #A890F0 | 🔮 Psychic | #F85888 |
| 🐛 Bug | #A8B820 | 🪨 Rock | #B8A038 |
| 👻 Ghost | #705898 | 🐉 Dragon | #7038F8 |
| 🌑 Dark | #705848 | ⚙️ Steel | #B8B8D0 |
| 🧚 Fairy | #EE99AC | ⚪ Normal | #A8A878 |

## 📝 API Reference

This app uses the free [PokeAPI](https://pokeapi.co/):

- **Endpoint**: `https://pokeapi.co/api/v2/pokemon/{id}`
- **Images**: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

This project is for educational purposes. Pokémon and Pokémon character names are trademarks of Nintendo.

---

Built with ❤️ using React Native
