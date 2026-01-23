# Treasure Hunt Game - Setup & Development Guide

## 🎯 Project Status

- ✅ Phase 1: Foundation (Auth, DB Schema, UI Layout)
- ✅ Phase 2: Room Management (Create, Delete, List, Code Generation)
- 🔄 Phase 3-5: Player Flow, Timer Sync, Realtime Features (Next)

## 📋 Quick Start

### 1. Environment Setup

```bash
# Install dependencies (already done)
npm install

# Create .env file with Supabase credentials
cp .env.example .env.local

# Add your Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Supabase Database Setup

1. Go to [supabase.com](https://supabase.com) and create a project
2. Copy Project URL and Anon Key to `.env.local`
3. In Supabase Console → SQL Editor, run the queries from [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
4. Enable Realtime:
   - Go to Realtime → Tables
   - Enable for: `rooms`, `players`, `game_sessions`
5. Configure Row Level Security policies (see DATABASE_SCHEMA.md for details)

### 3. Authentication Setup

In Supabase Console → Authentication:

1. Enable Email provider
2. Set email confirmation: OFF (for development)
3. Users can sign in via email/password

### 4. Run the Application

```bash
npm run dev
```

Visit http://localhost:5173

## 🏗️ Architecture

### File Structure

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client config
│   ├── roomService.ts       # Room CRUD & realtime
│   ├── playerService.ts     # Player management
│   ├── gameUtils.ts         # Utilities (code gen, timer, etc)
│   └── utils.ts             # General utilities
├── contexts/
│   └── GameContext.tsx       # Global game state
├── pages/
│   ├── Index.tsx            # Home page
│   ├── AdminAuth.tsx        # Admin login/signup
│   ├── AdminDashboard.tsx   # Room management
│   ├── PlayerJoin.tsx       # Join room
│   └── PlayerGame.tsx       # Challenge gameplay
└── types/
    └── game.ts              # TypeScript types
```

### Key Components

#### GameContext

Central state management with:

- Admin authentication (Supabase)
- Room CRUD operations
- Player management
- Challenge progress tracking
- Timer management

#### Services

- **roomService.ts**: Database operations for rooms
- **playerService.ts**: Database operations for players
- **Supabase Realtime**: Automatic sync across clients

## 🎮 Game Flow

### Admin Flow

1. Sign up/Login at `/admin/auth`
2. Create rooms at `/admin/dashboard`
3. Start/Stop/Reset games
4. Kick players, monitor leaderboard

### Player Flow

1. Join room at `/join` with code + username
2. Wait in lobby until admin starts game
3. Progress through 5 challenges
4. See realtime leaderboard

## 📊 Data Models

### Room

- Unique 6-character code
- Status: waiting → playing → finished
- Timer countdown
- House theme selection

### Player

- Username
- Progress (0-100%)
- Current challenge (1-5)
- Completed challenges array
- Join timestamp

### Admin

- Email-based authentication
- Can create/manage multiple rooms
- View all room players and progress

## 🔄 Realtime Features (Implemented)

### Supabase Realtime Subscriptions

- Room status updates
- Player progress changes
- Leaderboard live sync
- Player join/leave events

Subscribe example:

```typescript
const subscription = subscribeToRoomPlayers(roomId, (players) => {
  // Update UI with new player data
});

// Cleanup
subscription.unsubscribe();
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Admin signup works
- [ ] Admin login persists session
- [ ] Can create room with code
- [ ] Room code copies to clipboard
- [ ] Player can join with code
- [ ] Timer starts/stops correctly
- [ ] Challenge completion updates progress
- [ ] Leaderboard sorts by progress
- [ ] Victory screen on 100% progress

## 🚀 Next Phases

### Phase 3: Player Join Flow

- Implement join via room code
- Validate room exists and isn't finished
- Create waiting lobby
- Ready button for game start

### Phase 4: Game Mechanics

- Implement timer sync across all players
- Challenge completion logic
- Progress calculation (20% per challenge)
- Victory detection

### Phase 5: Realtime Features

- Live leaderboard updates
- Player presence indicators
- Automatic game end on timer expiry
- Real-time tiebreaker logic

## 📝 Notes

### Hybrid Architecture

- **localStorage**: Local fallback & session persistence
- **Supabase**: Primary data source for production
- Graceful fallback if Supabase unavailable

### Performance Optimization

- Rooms fetched on admin login
- Realtime subscriptions only on active game pages
- Debounced leaderboard updates
- Lazy-loaded challenge components

### Security (Post-Launch)

- Enable RLS policies in Supabase
- Verify admin ownership of rooms
- Validate player challenges server-side
- Rate limit API endpoints

## 🐛 Troubleshooting

### Supabase Connection Issues

```bash
# Check .env.local has correct credentials
# Verify VITE_ prefix for Vite to access env vars
# Check Supabase project is active
```

### Authentication Not Working

- Verify Email provider enabled in Supabase
- Check email address is correct
- Clear browser localStorage if needed

### Room Code Not Found

- Verify room code exists in database
- Check admin created room successfully
- Ensure code is uppercase, 6 characters

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Context Hooks](https://react.dev/reference/react/useContext)
- [Game of Thrones Theme](https://gameofthrones.fandom.com)
