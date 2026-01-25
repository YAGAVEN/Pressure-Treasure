# Top 3 Winners Implementation

## Overview

The game has been updated to calculate and display the top 3 winners instead of just a single winner. This provides a podium-style ranking system where the top 3 players are recognized for their performance.

## Changes Made

### 1. Type System Updates (`src/types/game.ts`)

- **Added `Winner` interface**: Represents a winner with `playerId`, `rank` (1-3), and `progress`
- **Updated `Room` interface**:
  - Added `winners: Winner[]` array to store top 3 winners
  - Kept `winnerId` for backward compatibility

### 2. Utility Functions (`src/lib/gameUtils.ts`)

- **Added `calculateTopWinners()` function**:
  - Takes a list of players
  - Sorts by progress (descending), then by `joinedAt` (ascending) for tiebreaking
  - Returns top 3 players with their rank and progress
  - Returns fewer than 3 if there aren't enough players

### 3. Database Schema (`TOP_WINNERS_MIGRATION.sql`)

- **New `winners` column** in `rooms` table (JSONB type)
- Stores array of winner objects: `[{playerId, rank, progress}, ...]`
- Includes migration script to convert existing `winner_id` data
- Indexed for better query performance

### 4. Room Service Updates (`src/lib/roomService.ts`)

- **Updated `updateRoomStatus()`**: Now accepts optional `winners` array parameter
- **Updated all room parsing functions**: Parse `winners` from database (handles both string and object JSONB)
- **Updated realtime subscription**: Properly parses winners array from database updates

### 5. Game Context Updates (`src/contexts/GameContext.tsx`)

- **Import `calculateTopWinners`** utility function
- **Updated `createRoom()`**: Initialize `winners: []` for new rooms
- **Updated timer end logic**: Calculate top 3 winners when time expires
- **Updated `endGame()`**: Calculate top 3 winners when manually ending game
- **Updated `resetGame()`**: Clear `winners` array when resetting

### 6. Player Game UI (`src/pages/PlayerGame.tsx`)

- **Victory banners** show medals based on rank:
  - 🥇 1st Place Victory!
  - 🥈 2nd Place Finish!
  - 🥉 3rd Place Podium!
- **Final Podium section**: Displays all 3 winners with medals and progress
- **Leaderboard highlights**: Top 3 winners get colored rings:
  - 1st: Gold ring (`ring-yellow-500`)
  - 2nd: Silver ring (`ring-gray-400`)
  - 3rd: Bronze ring (`ring-orange-600`)
- **Crown icons** in leaderboard with appropriate colors for each rank

### 7. Admin Dashboard UI (`src/pages/AdminDashboard.tsx`)

- **Top Winners section** in room cards
- Shows all 3 winners with medals, names, and progress percentages
- Replaces single winner display

## Database Migration

To enable this feature in your Supabase database, run the migration:

1. Open Supabase SQL Editor
2. Run the contents of `TOP_WINNERS_MIGRATION.sql`
3. This will:
   - Add `winners` JSONB column to `rooms` table
   - Create an index for performance
   - Migrate existing `winner_id` data to the new format

## How It Works

### Winner Calculation

1. When a game ends (timer expires or admin manually ends):
   - All players in the room are sorted by progress (highest first)
   - Ties are broken by `joinedAt` timestamp (earlier is better)
   - Top 3 players are selected
   - Each is assigned a rank (1, 2, or 3)

2. Winners are stored as:

```typescript
[
  { playerId: "abc123", rank: 1, progress: 100 },
  { playerId: "def456", rank: 2, progress: 80 },
  { playerId: "ghi789", rank: 3, progress: 60 },
];
```

### Display Logic

- **Player View**:
  - If player is in top 3, they see their specific rank message
  - All players see the full podium with all 3 winners
  - Leaderboard highlights top 3 with visual distinctions

- **Admin View**:
  - Room cards show all 3 winners with medals
  - Each winner's progress percentage is displayed

## Backward Compatibility

- `winnerId` field is maintained (set to 1st place winner's ID)
- Existing data is migrated automatically
- Old clients will still see the 1st place winner

## Testing Checklist

- ✅ Game ends with 1 player → shows 1 winner
- ✅ Game ends with 2 players → shows 2 winners
- ✅ Game ends with 3+ players → shows top 3 winners
- ✅ Ties are broken correctly by join time
- ✅ UI properly displays medals and rankings
- ✅ Admin dashboard shows all winners
- ✅ Realtime updates propagate winners correctly
