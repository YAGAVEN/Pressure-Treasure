# Service Layer API Documentation

## roomService.ts

Complete room management with real-time synchronization to Supabase.

### Functions

#### createRoom(name, description, houseTheme, timerDuration, adminId)

Creates a new treasure hunt room.

**Parameters:**

- `name` (string): Room name (e.g., "The Great Hunt")
- `description` (string): Optional description
- `houseTheme` (HouseTheme): House theme from Game of Thrones ('stark', 'lannister', 'targaryen', 'baratheon', 'greyjoy', 'tyrell', 'martell', 'arryn')
- `timerDuration` (number): Total timer duration in seconds
- `adminId` (string): Admin's ID creating the room

**Returns:** `Promise<Room>`

**Example:**

```typescript
const room = await roomService.createRoom(
  "Dragon Hunt",
  "Find the three dragon eggs",
  "targaryen",
  1800, // 30 minutes
  adminId,
);
```

---

#### getRoomByCode(code)

Retrieves a room by its unique code.

**Parameters:**

- `code` (string): 6-character room code

**Returns:** `Promise<Room | null>`

**Example:**

```typescript
const room = await roomService.getRoomByCode("ABC123");
if (room) {
  console.log(`Room: ${room.name}`);
}
```

---

#### getRoomsByAdmin(adminId)

Retrieves all rooms created by a specific admin.

**Parameters:**

- `adminId` (string): Admin's ID

**Returns:** `Promise<Room[]>`

**Example:**

```typescript
const myRooms = await roomService.getRoomsByAdmin(adminId);
console.log(`You have ${myRooms.length} rooms`);
```

---

#### updateRoomStatus(code, status, winnerId?)

Updates room status and optionally sets winner.

**Parameters:**

- `code` (string): Room code
- `status` (RoomStatus): 'waiting' | 'playing' | 'finished'
- `winnerId` (string, optional): Player ID of winner when finished

**Returns:** `Promise<void>`

**Example:**

```typescript
// Start game
await roomService.updateRoomStatus("ABC123", "playing");

// End game with winner
await roomService.updateRoomStatus("ABC123", "finished", winnerId);
```

---

#### deleteRoom(id)

Deletes a room and all associated data.

**Parameters:**

- `id` (string): Room UUID

**Returns:** `Promise<void>`

**Example:**

```typescript
await roomService.deleteRoom(roomId);
```

---

#### subscribeToRoomChanges(code, callback)

Subscribes to real-time room changes (status, timer, winner).

**Parameters:**

- `code` (string): Room code to watch
- `callback` (function): Called when room changes: `(updatedRoom: Room) => void`

**Returns:** `() => void` (unsubscribe function)

**Example:**

```typescript
const unsubscribe = roomService.subscribeToRoomChanges("ABC123", (room) => {
  console.log(`Room status: ${room.status}`);
  console.log(`Timer: ${room.timerRemaining}s`);
});

// When done:
unsubscribe();
```

---

## playerService.ts

Complete player management with online status tracking and progress persistence.

### Functions

#### addPlayerToRoom(roomId, username, roomCode)

Adds a player to a room.

**Parameters:**

- `roomId` (string): Room UUID
- `username` (string): Player's display name
- `roomCode` (string): Room's 6-char code

**Returns:** `Promise<Player>`

**Example:**

```typescript
const player = await playerService.addPlayerToRoom(
  roomId,
  "Jon Snow",
  "ABC123",
);
```

---

#### updatePlayerProgress(playerId, completedChallenges, progress)

Updates player's challenge progress.

**Parameters:**

- `playerId` (string): Player UUID
- `completedChallenges` (number[]): Array of completed challenge IDs
- `progress` (number): Progress percentage (0-100)

**Returns:** `Promise<void>`

**Example:**

```typescript
await playerService.updatePlayerProgress(
  playerId,
  [1, 2, 3], // Completed challenges 1, 2, 3
  60, // 60% progress
);
```

---

#### updatePlayerOnlineStatus(playerId, isOnline)

Updates player's online/offline status.

**Parameters:**

- `playerId` (string): Player UUID
- `isOnline` (boolean): True if player is online

**Returns:** `Promise<void>`

**Example:**

```typescript
// Player joins
await playerService.updatePlayerOnlineStatus(playerId, true);

// Player leaves
await playerService.updatePlayerOnlineStatus(playerId, false);
```

---

#### getOnlinePlayersCount(roomCode)

Counts how many players are currently online in a room.

**Parameters:**

- `roomCode` (string): Room's 6-char code

**Returns:** `Promise<number>`

**Example:**

```typescript
const onlineCount = await playerService.getOnlinePlayersCount("ABC123");
console.log(`${onlineCount} players online`);
```

---

#### removePlayer(playerId)

Removes a player from the game.

**Parameters:**

- `playerId` (string): Player UUID

**Returns:** `Promise<void>`

**Example:**

```typescript
await playerService.removePlayer(playerId);
```

---

#### subscribeToRoomPlayers(roomCode, callback)

Subscribes to real-time player changes in a room (joins, progress updates).

**Parameters:**

- `roomCode` (string): Room code to watch
- `callback` (function): Called with updated player list: `(players: Player[]) => void`

**Returns:** `() => void` (unsubscribe function)

**Example:**

```typescript
const unsubscribe = playerService.subscribeToRoomPlayers(
  "ABC123",
  (players) => {
    console.log(`${players.length} players in room`);
    players.forEach((p) => {
      console.log(`${p.username}: ${p.progress}%`);
    });
  },
);

// When done:
unsubscribe();
```

---

## supabase.ts

Supabase client configuration and initialization.

### Configuration

**Environment Variables Required:**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Initialization:**

```typescript
import { supabase } from "@/lib/supabase";

// Already initialized and ready to use
```

### Realtime Configuration

Tables with realtime enabled:

- `rooms` - Broadcasts room status/timer changes
- `players` - Broadcasts player progress and online status
- `game_sessions` - Historical game data (for analytics)
- `admin_profiles` - Admin authentication state

### Connection Features

- **Auto-reconnect**: Automatic reconnection on network loss
- **Offline support**: LocalStorage fallback when offline
- **Type safety**: Full TypeScript support for all operations

---

## GameContext Integration

### Context Functions

#### joinRoom(roomCode, username)

**Type:** `async (roomCode: string, username: string) => Promise<void>`

Joins a room with validation:

- Validates room exists
- Validates room not finished
- Creates player in Supabase
- Subscribes to realtime updates
- Sets current player in context

**Example:**

```typescript
const { joinRoom } = useGame();
await joinRoom("ABC123", "Daenerys");
```

---

#### leaveRoom()

**Type:** `async () => Promise<void>`

Leaves current room:

- Marks player offline in Supabase
- Clears player from context
- Unsubscribes from realtime

**Example:**

```typescript
const { leaveRoom } = useGame();
await leaveRoom();
```

---

#### completeChallenge(challengeId)

**Type:** `async (challengeId: number) => Promise<void>`

Completes a challenge:

- Validates challenge is current
- Updates progress in Supabase
- Checks for victory (100% complete)
- Auto-ends game if winner
- Increments to next challenge

**Example:**

```typescript
const { completeChallenge } = useGame();
await completeChallenge(1);
```

---

#### startGame(roomId)

**Type:** `(roomId: string) => void`

Starts a game (admin only):

- Updates room status to 'playing' in Supabase
- Starts 1-second timer countdown
- Broadcasts to all players via realtime
- Resets all player progress

**Example:**

```typescript
const { startGame } = useGame();
startGame(roomId);
```

---

#### endGame(roomId)

**Type:** `(roomId: string) => void`

Ends a game (admin only):

- Stops timer
- Calculates winner (highest progress)
- Updates room status to 'finished' in Supabase
- Broadcasts to all players

**Example:**

```typescript
const { endGame } = useGame();
endGame(roomId);
```

---

#### resetGame(roomId)

**Type:** `(roomId: string) => void`

Resets a game back to waiting (admin only):

- Stops any active timer
- Sets room status to 'waiting'
- Resets all player progress to 0
- Persists all changes to Supabase

**Example:**

```typescript
const { resetGame } = useGame();
resetGame(roomId);
```

---

## Data Persistence Patterns

### Create with Supabase

```typescript
const room = await roomService.createRoom(...);
// Returns object from Supabase with ID
```

### Update with Supabase

```typescript
await playerService.updatePlayerProgress(playerId, challenges, progress);
// Persists to database
```

### Subscribe to Real-Time Changes

```typescript
const unsubscribe = roomService.subscribeToRoomChanges(code, (room) => {
  // Called whenever room changes
});
```

### Error Handling

All functions include try-catch blocks with:

- Toast notifications for user feedback
- Console logging for debugging
- LocalStorage fallback for offline
- Graceful error recovery

---

## Real-Time Event Flow

```
Event: Player completes challenge
├─ UI: handleCompleteChallenge()
├─ GameContext: completeChallenge() [async]
├─ Supabase: playerService.updatePlayerProgress()
├─ Database: players table updated
├─ Realtime: postgres_changes triggers
├─ Subscribers: Receive updated player record
├─ All Players: Leaderboard updates
└─ End: All clients see same state
```

---

## Testing with Services

### Unit Testing

```typescript
// Mock the services
import * as roomService from '@/lib/roomService';
jest.mock('@/lib/roomService');

// Test in isolation
test('should create room', async () => {
  roomService.createRoom.mockResolvedValue(mockRoom);
  const result = await roomService.createRoom(...);
  expect(result).toEqual(mockRoom);
});
```

### Integration Testing

```typescript
// Use real Supabase in test environment
test('should join room and subscribe to updates', async () => {
  const room = await roomService.createRoom(...);
  const player = await playerService.addPlayerToRoom(...);

  const updates = [];
  playerService.subscribeToRoomPlayers(room.code, (players) => {
    updates.push(players);
  });

  // Trigger update...
  expect(updates.length).toBeGreaterThan(0);
});
```

---

**Last Updated**: Phase 5 Complete
**Status**: ✅ Production Ready
