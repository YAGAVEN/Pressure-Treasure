# Quick Reference Guide

Fast lookups for common development tasks.

---

## 🚀 Getting Started (5 min)

```bash
# 1. Install
npm install

# 2. Configure .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key

# 3. Setup Supabase (see DEPLOYMENT_SETUP.md Part 1)
# - Create project
# - Run SQL schema
# - Enable real-time

# 4. Run
npm run dev

# 5. Visit
http://localhost:5173
```

---

## 📋 Common Commands

```bash
# Development
npm run dev              # Start dev server on :5173
npm run build           # Production build to dist/
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run test            # Run Vitest

# Git
git add .
git commit -m "message"
git push origin main
```

---

## 🎯 Import Paths

```typescript
// Components
import { Button } from "@/components/ui/button";
import NavLink from "@/components/NavLink";

// Hooks
import { useGame } from "@/contexts/GameContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Services
import * as roomService from "@/lib/roomService";
import * as playerService from "@/lib/playerService";
import { supabase } from "@/lib/supabase";

// Utils
import { cn } from "@/lib/utils";
import { formatTime, getLeaderboard } from "@/lib/gameUtils";

// Types
import { Room, Player, GameStatus, HouseTheme } from "@/types/game";
```

---

## 🎮 GameContext API

### Use Game Hook

```typescript
const {
  // State
  admin,
  currentPlayer,
  players,
  rooms,

  // Auth
  isAdminAuthenticated,
  adminLogin,
  adminLogout,
  adminSignup,

  // Room Getters
  getRoom,
  getPlayersInRoom,

  // Room Management
  createRoom,
  deleteRoom,

  // Player Management
  joinRoom,
  leaveRoom,
  kickPlayer,

  // Game Controls
  startGame,
  endGame,
  resetGame,

  // Challenge
  completeChallenge,
} = useGame();
```

### Example Usage

```typescript
// Join room
await joinRoom("ABC123", "Jon Snow");

// Complete challenge
completeChallenge(1);

// Start game (admin)
startGame(roomId);

// Get players in room
const players = getPlayersInRoom("ABC123");
```

---

## 🗄️ Database Tables

### rooms

```sql
id, code, name, description, admin_id, status,
timer_duration, timer_remaining, house_theme,
winner_id, started_at, ended_at, created_at, updated_at
```

### players

```sql
id, room_code, username, progress, current_challenge,
completed_challenges, is_online, joined_at,
last_active_at, updated_at
```

### admin_profiles

```sql
id, email, password_hash, created_at, updated_at
```

### game_sessions

```sql
id, room_id, player_id, started_at, ended_at,
final_progress, placed
```

---

## 🔧 Service Functions Quick Ref

### roomService

```typescript
// Create
const room = await roomService.createRoom(
  name, description, houseTheme, timerDuration, adminId
);

// Read
const room = await roomService.getRoomByCode(code);
const rooms = await roomService.getRoomsByAdmin(adminId);

// Update
await roomService.updateRoomStatus(code, status, winnerId?);

// Delete
await roomService.deleteRoom(id);

// Subscribe
const unsubscribe = roomService.subscribeToRoomChanges(
  code,
  (room) => { /* handle update */ }
);
```

### playerService

```typescript
// Create
const player = await playerService.addPlayerToRoom(roomId, username, roomCode);

// Update
await playerService.updatePlayerProgress(playerId, challenges, progress);
await playerService.updatePlayerOnlineStatus(playerId, isOnline);

// Read
const count = await playerService.getOnlinePlayersCount(roomCode);

// Delete
await playerService.removePlayer(playerId);

// Subscribe
const unsubscribe = playerService.subscribeToRoomPlayers(
  roomCode,
  (players) => {
    /* handle update */
  },
);
```

---

## 🎨 Tailwind Classes Quick Ref

```typescript
// Layout
"flex gap-3"; // Flexbox with gap
"grid grid-cols-3 gap-4"; // 3-column grid
"absolute inset-0"; // Fill parent
"sticky top-0"; // Sticky position

// Sizing
"w-full h-screen"; // Full size
"w-96 h-10"; // Specific size
"min-h-0"; // Remove min-height
"aspect-square"; // 1:1 ratio

// Colors
"bg-primary text-white"; // Gold background, white text
"text-muted-foreground"; // Light gray text
"border border-primary/50"; // Semi-transparent border

// Spacing
"px-4 py-3"; // Padding
"space-y-2"; // Vertical space between children
"mb-4"; // Margin bottom

// States
"hover:bg-primary/10"; // Hover state
"disabled:opacity-50"; // Disabled state
"focus:ring-2 focus:ring-primary"; // Focus ring

// Responsive
"md:grid-cols-2 lg:grid-cols-3"; // Responsive layout
"hidden md:block"; // Hidden on mobile

// Typography
"font-cinzel font-bold"; // Serif, bold
"truncate"; // Text overflow ellipsis
"text-center"; // Text alignment
```

---

## 🔌 Supabase Client

```typescript
import { supabase } from "@/lib/supabase";

// Query
const { data, error } = await supabase
  .from("rooms")
  .select("*")
  .eq("code", "ABC123");

// Insert
const { data, error } = await supabase
  .from("players")
  .insert({ room_code, username, progress: 0 });

// Update
const { data, error } = await supabase
  .from("rooms")
  .update({ status: "playing" })
  .eq("id", roomId);

// Delete
const { error } = await supabase.from("rooms").delete().eq("id", roomId);

// Real-time Subscribe
const subscription = supabase
  .channel(`room:${code}`)
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "rooms",
      filter: `code=eq.${code}`,
    },
    (payload) => {
      console.log("Change:", payload);
    },
  )
  .subscribe();

// Unsubscribe
subscription.unsubscribe();
```

---

## 🧩 shadcn/ui Components

```typescript
// Available components (30+)
Button, Card, Input, Select, Textarea, Dialog,
Badge, Alert, Progress, Tabs, Table, Toast,
Tooltip, Popover, DropdownMenu, Avatar,
Checkbox, RadioGroup, Switch, Label, Form,
// ... and 10+ more

// Example usage
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => alert('Clicked!')}>
          Click me
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 🎨 Color System

```typescript
// Primary (Gold)
"text-primary"; // #d4af37
"bg-primary";
"border-primary";

// Backgrounds
"bg-background"; // #0a0a0a
"bg-muted"; // #27272a

// Text
"text-foreground"; // #e4e4e7
"text-muted-foreground"; // #a1a1aa

// Status
"text-green-500"; // Success
"text-red-500"; // Error
"text-yellow-500"; // Warning
"text-blue-500"; // Info

// House Themes
"bg-slate-800"; // Stark
"bg-amber-500"; // Lannister
"bg-red-600"; // Targaryen
"bg-blue-900"; // Baratheon
"bg-cyan-600"; // Greyjoy
"bg-lime-600"; // Tyrell
"bg-orange-600"; // Martell
"bg-slate-300"; // Arryn
```

---

## ⚙️ Configuration Files

### .env.local

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### vite.config.ts

Port, plugins, optimizations

### tsconfig.json

- `@` path alias = src/
- ES2020 target
- Strict mode enabled

### tailwind.config.ts

- Dark mode forced
- Custom colors (primary, muted)
- Custom fonts (cinzel)

---

## 🐛 Debugging Tips

```typescript
// Check game context state
const { rooms, players, currentPlayer } = useGame();
console.log("Current player:", currentPlayer);
console.log("Rooms:", rooms);

// Monitor Supabase calls
import { supabase } from "@/lib/supabase";
// Logs visible in Supabase Dashboard → Logs

// Check subscriptions
const unsubscribe = playerService.subscribeToRoomPlayers(
  "ABC123",
  (players) => {
    console.log("Subscription update:", players);
  },
);

// Browser DevTools
// - Network tab: Check WebSocket connections
// - Console: See any errors/warnings
// - Application: Check localStorage for fallback data
```

---

## 📱 Responsive Breakpoints

```typescript
// Mobile first approach
<div className="text-sm md:text-base lg:text-lg">
  // sm:  640px
  // md:  768px
  // lg:  1024px
  // xl:  1280px
  // 2xl: 1536px
</div>

// Hide/show based on breakpoint
<div className="hidden md:block">Only on tablet+</div>
<div className="md:hidden">Only on mobile</div>
```

---

## 🔗 Useful Links

- **Code**: [Project root](.)
- **Docs**: [GAMEPLAY_FLOW.md](./GAMEPLAY_FLOW.md), [SERVICE_LAYER_API.md](./SERVICE_LAYER_API.md)
- **Supabase**: https://supabase.com/dashboard
- **React Docs**: https://react.dev
- **Tailwind**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

## ⚡ Performance Tips

```typescript
// Memoize expensive components
const MyComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // handler code
}, [dependencies]);

// Lazy load routes
const PlayerGame = lazy(() => import('@/pages/PlayerGame'));

// Code split
<Suspense fallback={<Loading />}>
  <PlayerGame />
</Suspense>
```

---

## 🔐 Security Checklist

Before deploying:

- ✅ Remove .env.local from git (use .env.example)
- ✅ Use strong Supabase password
- ✅ Enable Supabase RLS policies
- ✅ Set CORS properly
- ✅ Use HTTPS only
- ✅ Rotate credentials periodically

---

## 📊 Example: Adding a Feature

### 1. Type Definition (types/game.ts)

```typescript
export interface NewFeature {
  id: string;
  name: string;
}
```

### 2. Service (lib/featureService.ts)

```typescript
export async function createFeature(data) {
  return await supabase.from("features").insert(data);
}
```

### 3. Context (contexts/GameContext.tsx)

```typescript
const [features, setFeatures] = useState<NewFeature[]>([]);

const addFeature = useCallback(
  async (data) => {
    const result = await featureService.createFeature(data);
    setFeatures([...features, result]);
  },
  [features],
);

// Export in provider
```

### 4. Component (pages/YourPage.tsx)

```typescript
import { useGame } from '@/contexts/GameContext';

export default function YourPage() {
  const { features, addFeature } = useGame();

  return (
    <Button onClick={() => addFeature({})}>
      Add Feature
    </Button>
  );
}
```

---

## 🚀 Deployment Checklist

```
Before deploying to production:

Environment
- [ ] .env configured correctly
- [ ] No sensitive data in code
- [ ] Supabase URL verified
- [ ] API keys rotated

Code
- [ ] No console.logs (or filtered)
- [ ] Error boundaries implemented
- [ ] Loading states handled
- [ ] All tests passing

Build
- [ ] npm run build succeeds
- [ ] No console errors
- [ ] Bundle size acceptable
- [ ] Preview looks correct

Database
- [ ] Backups configured
- [ ] Replication enabled
- [ ] Indices created
- [ ] RLS policies set

Monitoring
- [ ] Error tracking enabled
- [ ] Performance monitoring on
- [ ] Uptime checks configured
- [ ] Logs aggregation setup
```

---

**Keep this file open while developing! 🚀**

Last Updated: Phase 5 Complete
