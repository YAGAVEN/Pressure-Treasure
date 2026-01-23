# Treasure Hunt Game - Complete Gameplay Flow

## Overview

This document details the complete gameplay flow from player join through victory, with real-time synchronization across all clients via Supabase.

## Architecture

### Real-Time Infrastructure

- **Supabase PostgreSQL**: Persistent database for rooms, players, and game sessions
- **Supabase Realtime (WebSocket)**: postgres_changes channel subscriptions on:
  - `rooms` table - broadcasts room status/timer/winner changes
  - `players` table - broadcasts player progress and challenge completion
  - `game_sessions` table - tracks historical game data
- **GameContext**: Central React state management with Supabase persistence
- **Service Layer**: Abstracted Supabase operations (roomService.ts, playerService.ts)

### Key Tables

#### rooms

```sql
- id: UUID (primary key)
- code: VARCHAR(6) (unique room code)
- name: VARCHAR(100)
- description: TEXT
- adminId: UUID (admin_profiles reference)
- status: ENUM('waiting', 'playing', 'finished')
- timerDuration: INTEGER (seconds)
- timerRemaining: INTEGER (current countdown)
- houseTheme: VARCHAR(20) (Game of Thrones house)
- winnerId: UUID (players reference)
- startedAt: TIMESTAMP
- endedAt: TIMESTAMP
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### players

```sql
- id: UUID (primary key)
- roomCode: VARCHAR(6) (rooms reference)
- username: VARCHAR(50)
- progress: INTEGER (0-100)
- currentChallenge: INTEGER (1-5)
- completedChallenges: TEXT[] (array of challenge IDs)
- isOnline: BOOLEAN
- joinedAt: TIMESTAMP
- lastActiveAt: TIMESTAMP
```

## Phase 3: Player Join & Waiting Lobby

### Player Join Flow

1. **Player enters room code + username** → PlayerJoin page
2. **Code validation** (6 chars, alphanumeric)
3. **Username validation** (max 20 chars)
4. **Call GameContext.joinRoom()** (async)
   - Validates room exists and not finished
   - Creates player record in Supabase
   - Joins realtime subscriptions
   - Updates local GameContext state
5. **Redirect to PlayerGame** with room code
6. **Realtime update**: All players see new player join via postgres_changes

### Waiting Lobby Display

PlayerGame.tsx shows:

- Animated pulsing indicator ("Waiting for Game Master")
- Player count: "{n} players ready"
- List of joining players with names
- Current player marked as "(You)"
- Continues to update as players join in real-time

### Online Status Tracking

- `playerService.updatePlayerOnlineStatus()` sets isOnline = true on join
- `playerService.getOnlinePlayersCount()` returns active players
- Player marked offline when leaving room

### Subscriptions Active

- **playerRoomSubscription**: Listens for new players joining same room
- **roomSubscription**: Listens for admin starting game

## Phase 4: Game Mechanics

### Game Start (Admin Initiates)

1. **Admin clicks "Start" button** on AdminDashboard
2. **GameContext.startGame(roomId)** called
   - Sets room status = 'playing'
   - Persists to Supabase via roomService.updateRoomStatus()
   - Resets all player progress to 0%
   - Starts 1-second interval timer
3. **Realtime broadcast**: All players receive room status change
4. **All players**:
   - See timer countdown on header
   - See "Complete Challenge" button enabled
   - Header timer turns gold (#d4af37) when playing

### Timer Synchronization

- **Server truth**: Supabase stores authoritative timerRemaining value
- **Client sync**: 1-second interval decrements local timerRemaining
- **Drift correction**: Real-time subscription updates correct client clocks
- **Edge case handling**:
  - Network delay: Local timer continues, corrected on subscription update
  - Multi-client: All clients use same interval timing
  - Pause/Resume: Interval clears on room status change

### Challenge Completion Flow

1. **Player views current challenge** (sequentially 1→5)
2. **Challenge UI shows**:
   - Challenge number and name
   - Description
   - Lock icon if not current challenge
   - "Complete Challenge" button (enabled only if current + playing)
3. **Player clicks "Complete Challenge"**
   - Calls GameContext.completeChallenge(challengeId)
   - Updates local player state: progress++, currentChallenge++, completedChallenges push
   - Persists to Supabase via playerService.updatePlayerProgress()
   - Checks victory condition: if progress === 100%, mark as winner
4. **Realtime update**:
   - Other players see this player's progress update via postgres_changes
   - Leaderboard instantly reflects new rank/progress
5. **Victory detection**:
   - If player reaches 100% (all 5 challenges), game ends automatically
   - roomService.updateRoomStatus() sets status='finished' + winnerId
   - Broadcasts to all players

### Challenge Lock System

- Player can ONLY complete challenges sequentially
- Challenge 2 locked until Challenge 1 complete
- UI shows lock state with description: "Complete challenge {n} first"
- Prevents cheating / skipping challenges

### Progress Calculation

- Formula: `(completedChallenges.length / 5) * 100`
- Updated instantly on challenge completion
- Persisted to Supabase
- Used for leaderboard ranking

## Phase 5: Real-Time Features & Victory

### Leaderboard (Real-Time)

Display shows:

1. **Ranking** by progress % (descending)
2. **Player name** with "(You)" indicator
3. **Progress %** for each player
4. **Medal indicators**: 🥇 1st, 🥈 2nd, 🥉 3rd, etc
5. **Winner crown** if game finished
6. **Live updates**: postgres_changes subscription updates instantly

### Player Presence Indicators

Features:

- **Online status**: Green dot next to name (isOnline = true)
- **Offline indicator**: Gray/grayed out player name
- **Current player highlight**: Gold/primary color
- **Automatic offline**: When player leaves room or closes connection

### Timer Auto-End Game

When timer reaches 0:

1. GameContext.startGame() detects timerRemaining <= 0
2. Calculates winner: highest progress player
3. Sets room status = 'finished'
4. Sets winnerId to winner's player ID
5. Broadcasts via Supabase to all clients
6. All players see Victory/Game Over screen

### Victory Screen (Winner)

```
🏆 Victory!
You have claimed the Iron Throne!
[View Final Rankings] [Play Again?]
```

### Game Over Screen (Others)

```
Game Over
{Winner Name} has won the hunt!
[View Final Rankings] [Return to Lobby]
```

### End Game (Admin Terminates)

Admin can click "End Game" to force end before timer expires:

1. AdminDashboard calls GameContext.endGame(roomId)
2. Clears timer interval
3. Calculates winner (highest progress)
4. Updates room status = 'finished' + winnerId
5. Persists to Supabase
6. Broadcasts to all players

### Reset Game (Admin Resets)

Admin can reset game back to waiting state:

1. AdminDashboard calls GameContext.resetGame(roomId)
2. Clears any active timers
3. Sets room status = 'waiting'
4. Resets all players:
   - progress = 0
   - currentChallenge = 1
   - completedChallenges = []
5. Updates Supabase for all players
6. Ready for new game start

## Data Flow Diagrams

### Join Room Flow

```
Player: PlayerJoin
    ↓ enter code + username
Player: handleJoin() [async]
    ↓ validate
GameContext: joinRoom() [async]
    ↓ playerService.addPlayerToRoom()
Supabase: Insert into players table
    ↓ subscribes to room changes
Realtime: postgres_changes
    ↓ player subscription
GameContext: setPlayers() with new player
    ↓ update UI
Player: PlayerGame (redirect)
    ↓ visible in waiting lobby for all
Others: See new player in leaderboard
```

### Challenge Completion Flow

```
Player: PlayerGame [playing]
    ↓ click "Complete Challenge"
Player: handleCompleteChallenge()
    ↓
GameContext: completeChallenge() [async]
    ↓ playerService.updatePlayerProgress()
Supabase: Update players table
    ↓ postgres_changes
Realtime: Broadcast to room
    ↓
Others: PlayerGame
    ↓ subscription updates player progress
    ↓ leaderboard re-renders instantly
All Players: See updated rankings
```

### Game End Flow

```
Admin: AdminDashboard
    ↓ click "Start" or timer reaches 0
Admin/Timer: endGame()
    ↓ roomService.updateRoomStatus('finished')
Supabase: Update rooms table status
    ↓ postgres_changes
Realtime: Broadcast to all clients
    ↓
All Players: GameContext updates room.status
    ↓
PlayerGame: Renders victory/game-over screen
    ↓ shows winner + final rankings
```

## Real-Time Subscription Details

### Player Subscription Effect

```tsx
useEffect(() => {
  if (!room?.code) return;

  const unsubscribe = playerService.subscribeToRoomPlayers(
    room.code,
    (updatedPlayers) => {
      setPlayers((prev) => {
        // Merge updates with local state
        return [...updatedPlayers];
      });
    },
  );

  return () => unsubscribe?.();
}, [room?.code]);
```

Listens for: Player join, player progress update, player status change

### Room Subscription Effect

```tsx
useEffect(() => {
  if (!room?.code) return;

  const unsubscribe = roomService.subscribeToRoomChanges(
    room.code,
    (updatedRoom) => {
      setRooms((prev) =>
        prev.map((r) => (r.code === room.code ? updatedRoom : r)),
      );
    },
  );

  return () => unsubscribe?.();
}, [room?.code]);
```

Listens for: Room status change, timer update, winner announcement

## Offline Fallback

All data persisted to localStorage for offline support:

- localStorage keys: `game_state`, `players_{roomCode}`, `admin_state`
- Updates sync to Supabase when connection restored
- Real-time subscriptions auto-reconnect on network recovery

## Error Handling

### Connection Loss

- Local state continues to function
- UI shows graceful degradation
- Auto-reconnect on network restore
- Subscription reestablished

### Player Disconnect

- Player marked offline after 30-second timeout
- Player data persisted in database
- Can rejoin room with same username
- Progress preserved from previous attempt

### Game State Corruption

- Validation in completeChallenge ensures sequential progression
- ChallengeID validation prevents invalid updates
- Leaderboard recalculation on each update
- Database constraints prevent impossible states

## Performance Optimizations

1. **Efficient Re-renders**:
   - GameContext uses useCallback to prevent unnecessary updates
   - State updates batched in setRooms/setPlayers

2. **Subscription Filtering**:
   - postgres_changes filters by room code
   - Only relevant updates trigger re-renders

3. **Timer Optimization**:
   - Single setInterval per room (not per player)
   - Cleared on game status change
   - Prevents memory leaks

4. **Local State Caching**:
   - Player/room data cached in GameContext
   - Reduces Supabase queries
   - Realtime subscriptions keep cache fresh

## Testing Scenarios

### Scenario 1: Multi-Player Real-Time Updates

1. Open 3 browser windows (or tabs with dev tools)
2. Each "joins" same room with different usernames
3. Verify all three see each other in real-time
4. Check online status indicators update instantly

### Scenario 2: Challenge Completion Race

1. Two players in same room, game playing
2. Both complete challenge simultaneously
3. Verify leaderboard updates correctly for both
4. Check progress % calculates correctly

### Scenario 3: Timer Sync

1. Open room on two clients
2. Admin starts game
3. Compare timer display on both clients
4. Verify they stay synchronized within ±1 second

### Scenario 4: Network Disconnect & Reconnect

1. Player in game, start challenge
2. Disconnect network (dev tools network tab)
3. Verify local state continues, UI graceful
4. Reconnect network
5. Verify data syncs with server, subscriptions re-establish

### Scenario 5: Victory Detection

1. Room with 2 players
2. Start game
3. First player completes all 5 challenges
4. Verify game ends automatically
5. Verify both players see victory screen with winner announced

---

**Last Updated**: Phase 5 Complete
**Status**: ✅ Production Ready
