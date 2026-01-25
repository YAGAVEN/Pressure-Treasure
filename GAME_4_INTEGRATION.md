# Game 4 Integration - Maester's Trial

## Overview
The 4th game challenge "Secrets of the Citadel" (The Maester's Trial) has been successfully integrated into the treasure hunt.

## What Was Done

### 1. Installed Dependencies
- `string-similarity`: For comparing user descriptions with target text
- `framer-motion`: For smooth animations and transitions

### 2. Created Components
- **`/src/components/Game4Challenge.tsx`**: Main game component with:
  - 5 levels of image description challenges
  - Real-time accuracy meter (0-100%)
  - Hint system for each level
  - Smooth animations between levels
  - Victory screen upon completion
  - 80% accuracy threshold to proceed

### 3. Created Data
- **`/src/data/game4Levels.ts`**: Contains 5 Game of Thrones themed levels with:
  - Image paths
  - Target descriptions
  - Hints for each level

### 4. Created Page Route
- **`/src/pages/Game4Page.tsx`**: Wrapper page that:
  - Validates room and player status
  - Ensures game is active
  - Handles challenge completion
  - Navigates back to main game

### 5. Updated Routes
- **`/src/App.tsx`**: Added `/game4/:roomCode` route

### 6. Updated PlayerGame Component
- **`/src/pages/PlayerGame.tsx`**: Added button for Challenge 4 that navigates to the Maester's Trial

## How It Works

### Game Flow
1. Player clicks "Start Maester's Trial" button on Challenge 4
2. Navigates to `/game4/:roomCode`
3. Player sees an image and must describe what they see
4. Real-time accuracy meter shows similarity to target description
5. Must achieve 80%+ accuracy to proceed to next level
6. After completing all 5 levels, challenge is marked complete
7. Returns to main game screen

### Accuracy System
- Uses Levenshtein distance algorithm (string-similarity library)
- Compares user input to target description
- Provides themed feedback based on accuracy:
  - < 30%: "The night is dark and full of terrors..."
  - < 50%: "You know nothing, Jon Snow."
  - < 70%: "A mind needs books like a sword needs a whetstone."
  - < 80%: "Winter is coming... but so are you."
  - ≥ 80%: "The old gods favor you!"

## Images Setup

### Current Status
⚠️ **Images need to be added manually**

The game expects 5 images in `/public/images/`:
- `level1_jon.jpg` - Jon Snow on battlefield
- `level2_dany.jpg` - Daenerys with army
- `level3_throne.jpg` - The Iron Throne
- `level4_dragon.jpg` - Daenerys with dragon
- `level5_hall.jpg` - Dragonstone hall

### Adding Images
1. Find appropriate Game of Thrones images matching descriptions in `/src/data/game4Levels.ts`
2. Place them in `/public/images/` directory
3. Ensure filenames match exactly

The component has fallback handling for missing images.

## Customization

### Difficulty
To adjust difficulty, modify the accuracy threshold in `Game4Challenge.tsx`:
```typescript
setCanProceed(accuracyPercent > 80); // Change 80 to desired percentage
```

### Add More Levels
Edit `/src/data/game4Levels.ts` and add new level objects:
```typescript
{
  id: 6,
  image: "/images/level6_new.jpg",
  target: "Your target description here",
  hint: "Your hint here"
}
```

### Styling
The component uses:
- Tailwind CSS classes
- shadcn/ui components (Card, Button, Progress)
- Framer Motion for animations
- Medieval-themed styling consistent with the app

## Testing
1. Create/join a room
2. Start the game as Game Master
3. Navigate to Challenge 4
4. Click "Start Maester's Trial"
5. Try describing images with varying accuracy
6. Complete all 5 levels

## Integration Complete ✅
- Challenge 4 now has a fully functional mini-game
- Syncs with room state and player progress
- Maintains medieval/GoT theme
- Mobile responsive
- Includes animations and feedback
