# Riddle Challenge Integration Guide

## Overview
This guide shows you how to integrate the **Riddle Challenge** component into your Pressure Treasure game. The challenge presents computer science riddles with fill-in-the-blank style answers (5-8 characters).

## Files Created

### 1. `/public/questions.json`
- Contains 15 computer science riddles
- Each question has: riddle, answer (5-8 chars), and hint
- Randomly selects 10 questions when the game starts
- You can add more questions later - just follow the same format

### 2. `/src/components/RiddleChallenge.tsx`
- React component for the riddle challenge UI
- Features:
  - Randomizes 10 questions from the pool
  - Shows progress (X / 10)
  - Fill-in-the-blank answer input
  - Optional hint button
  - Visual feedback (green for correct, red for incorrect)
  - Auto-advances to next question

## Integration Steps

### Step 1: Import the Component

In your `src/pages/PlayerGame.tsx` (or wherever you want to use it), add the import:

```typescript
import { RiddleChallenge } from '@/components/RiddleChallenge';
```

### Step 2: Add to Your Challenge List

Find the section where challenges are rendered (around line 413 in `PlayerGame.tsx`). 

**Option A: Replace Challenge #2** (Riddle of the Maester)
```tsx
{isCurrent && challenge.id === 2 && (
  <CardContent className="pt-2">
    <RiddleChallenge 
      onComplete={() => handleCompleteChallenge(challenge.id)}
      disabled={room.status !== 'playing'}
    />
  </CardContent>
)}

{isCurrent && challenge.id !== 2 && (
  <CardContent className="pt-2">
    <Button 
      onClick={() => handleCompleteChallenge(challenge.id)}
      disabled={room.status !== 'playing' || isCompleted}
      className="w-full font-cinzel"
    >
      {isCompleted ? '✓ Completed' : room.status === 'playing' ? 'Complete Challenge' : 'Waiting for Game Master...'}
    </Button>
  </CardContent>
)}
```

**Option B: Add as a New Separate Challenge**
You can also keep it as a standalone component on its own page.

### Step 3: Test It

1. Start your Vite dev server: `npm run dev`
2. Navigate to challenge #2 in the game
3. Try solving riddles:
   - Answer: "ARRAY" (5 letters)
   - Answer: "STACK" (5 letters)
   - Answer: "NULL" (4 letters) ❌ - too short, won't be in the list
   - etc.

## File Placement Summary

```
your-vite-project/
├── public/
│   └── questions.json          ← Riddle questions data
├── src/
│   ├── components/
│   │   └── RiddleChallenge.tsx ← Riddle component
│   └── pages/
│       └── PlayerGame.tsx      ← Import and use here
```

## Adding More Questions

Edit `/public/questions.json` and add more entries:

```json
{
  "id": 16,
  "riddle": "Your riddle here...",
  "answer": "ANSWER",  
  "hint": "A helpful hint"
}
```

**Requirements:**
- Answer length must be 5-8 characters
- Answer should be all caps (component handles this automatically)
- Make it a riddle, not a direct question

## Customization

### Change Number of Questions
In `RiddleChallenge.tsx`, line 36:
```typescript
setSelectedQuestions(shuffled.slice(0, 10)); // Change 10 to any number
```

### Change Answer Length Range
Modify validation or filter questions by length before selection.

### Styling
The component uses your existing Tailwind classes and shadcn/ui components, so it matches your theme automatically.

## Example Riddles Included

1. **ECHO** - Sound travels...
2. **ARRAY** - Data structure
3. **CACHE** - Fast storage  
4. **LOGIN** - Access control
5. **QUEUE** - First in, first out
6. **STACK** - Plates pile up
7. **GRAPH** - Nodes & edges
8. **LOOP** - Repeating code
9. **LINK** - Web navigation
10. **BINARY** - Two digits only
11. **SORT** - Organizing data
12. **POINTER** - Memory address
13. **FUNCTION** - Reusable code
14. **NULL** - No value
15. **COMPILER** - Code translator

All answers are between 4-8 characters (most are 5-7).

## Notes

- Questions are fetched from `/public/questions.json` at runtime
- The component randomly selects 10 questions each time it mounts
- Players must complete all 10 riddles to pass the challenge
- No time limit per question (only the overall game timer applies)
