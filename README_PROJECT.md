# 🏰 Pressure Treasure - Complete Project Guide

Welcome! This document guides you through the entire Treasure Hunt Game project.

## 📚 Documentation Index

### Core Documentation

1. **[PHASE_1_2_SUMMARY.md](PHASE_1_2_SUMMARY.md)** ⭐ START HERE
   - What's been completed
   - Architecture overview
   - Status and next steps

2. **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - BEFORE RUNNING
   - Step-by-step Supabase configuration
   - Database table creation
   - Authentication setup
   - RLS policies

3. **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - REFERENCE
   - Complete database design
   - SQL scripts
   - Table relationships
   - Realtime configuration

4. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - PROJECT SETUP
   - Environment configuration
   - Project architecture
   - File structure
   - Testing checklist

### Implementation Guides

5. **[PHASE_2_REFERENCE.md](PHASE_2_REFERENCE.md)** - CODE REFERENCE
   - Phase 2 implementation details
   - Key code snippets
   - Testing scenarios
   - Troubleshooting

6. **[PHASE_3_GUIDE.md](PHASE_3_GUIDE.md)** - NEXT PHASE
   - Detailed Phase 3 plan
   - Code examples
   - Implementation checklist
   - Player join flow

## 🚀 Quick Start (5 minutes)

### 1. Set Up Environment

```bash
cd /media/yagaven/CODING/PROJECTS/Pressure-Treasure
npm install  # Already done
cp .env.example .env.local
```

### 2. Configure Supabase

Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) steps 1-7

- Create Supabase project
- Add credentials to .env.local
- Run SQL scripts
- Enable Realtime

### 3. Run Application

```bash
npm run dev
# Visit http://localhost:5173
```

### 4. Test Admin Flow

1. Sign up as admin at `/admin/auth`
2. Create room at `/admin/dashboard`
3. Check Supabase Console → Tables → rooms

✅ **If you see your room in Supabase, setup is complete!**

## 📊 Project Status

### ✅ Phase 1 & 2 Complete

- [x] Admin authentication (Supabase)
- [x] Database schema designed
- [x] Room creation with unique codes
- [x] Room deletion
- [x] Room listing by admin
- [x] Realtime subscription setup
- [x] All UI layouts complete
- [x] TypeScript types defined

### 🔄 Phase 3 (Next)

- [ ] Player join with room code
- [ ] Waiting lobby with player list
- [ ] Player presence tracking
- [ ] Real-time player updates

### ⏳ Phase 4 (Future)

- [ ] Timer synchronization
- [ ] Challenge completion logic
- [ ] Progress tracking
- [ ] Victory detection

### ⏳ Phase 5 (Future)

- [ ] Live leaderboard updates
- [ ] Player presence indicators
- [ ] Automatic game end on timer
- [ ] Tiebreaker logic

## 🎯 Key Features

### 🛡️ Admin Features

- Email/password authentication
- Create rooms with unique codes
- View all players in real-time
- Start/stop/reset games
- Kick players from rooms
- Monitor leaderboard

### 🎮 Player Features

- Join with 6-character room code
- Choose display username
- See other players joining
- Complete 5 challenges
- Real-time leaderboard
- Victory screen

### ⚡ Technical Features

- Supabase backend (auth, database, realtime)
- React + TypeScript frontend
- Real-time updates via WebSocket
- localStorage fallback
- Responsive design
- Dark theme with gold accents

## 🏗️ Architecture

```
Frontend (React)
├── Pages: Admin Dashboard, Player Game, etc.
├── GameContext: Central state management
├── Services: roomService, playerService
└── UI Components: shadcn/ui

Backend (Supabase)
├── Authentication: Email/password
├── Database: Rooms, Players, Sessions, Profiles
└── Realtime: WebSocket for live updates
```

## 📁 Important Files

### Configuration

- `.env.local` - Environment variables (create from .env.example)
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration

### Source Code

- `src/contexts/GameContext.tsx` - Main state management
- `src/lib/roomService.ts` - Room database operations
- `src/lib/playerService.ts` - Player database operations
- `src/lib/supabase.ts` - Supabase client setup
- `src/pages/` - Page components

### Documentation

- `DATABASE_SCHEMA.md` - Database design
- `SUPABASE_SETUP.md` - Supabase configuration
- `SETUP_GUIDE.md` - Project setup
- `PHASE_1_2_SUMMARY.md` - Completion summary
- `PHASE_2_REFERENCE.md` - Implementation reference
- `PHASE_3_GUIDE.md` - Next phase guide

## 🔧 Available Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Quality
npm run lint            # Run ESLint
npm test               # Run tests
npm run test:watch     # Watch mode tests

# Database (with Supabase CLI)
supabase link          # Link to Supabase project
supabase db pull       # Pull database changes
supabase db push       # Push local changes
```

## 🧪 Testing Checklist

### Admin Flow

- [ ] Sign up with email/password
- [ ] Log in successfully
- [ ] Session persists on refresh
- [ ] Can create room
- [ ] Room code is 6 characters
- [ ] Can delete room
- [ ] Can see room status
- [ ] Can see player list

### Player Flow

- [ ] Join with valid code
- [ ] Join with invalid code → error
- [ ] See waiting lobby
- [ ] See other players joining
- [ ] See player count
- [ ] Cannot join finished game

### Realtime

- [ ] Open 2 browser windows
- [ ] Create room in window 1
- [ ] Window 2 sees new room without refresh
- [ ] Create player in window 2
- [ ] Window 1 sees new player without refresh

## 🐛 Troubleshooting

### "VITE_SUPABASE_URL not found"

→ Check `.env.local` has `VITE_` prefix and restart dev server

### "Supabase connection failed"

→ Verify URL and Anon Key in `.env.local` are correct

### "Admin profile not created"

→ Check `admin_profiles` table exists and RLS allows insert

### "Realtime not working"

→ Verify Realtime is enabled for tables in Supabase Console

→ See [SETUP_GUIDE.md](SETUP_GUIDE.md) for more troubleshooting

## 💡 Tips

### Development

- Use Supabase Console to inspect data directly
- Check browser DevTools for network requests
- Use `console.log` in service functions for debugging
- Restart dev server after .env changes

### Best Practices

- Always handle errors from Supabase calls
- Clean up subscriptions in useEffect cleanup
- Use TypeScript types for type safety
- Test with real Supabase data

### Performance

- Rooms loaded once on admin login
- Realtime subscriptions auto-cleanup
- localStorage acts as offline fallback
- Realtime updates are efficient

## 🎓 Learning Resources

### Supabase

- [Official Docs](https://supabase.com/docs)
- [SQL Reference](https://supabase.com/docs/guides/sql)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Auth Guide](https://supabase.com/docs/guides/auth)

### React

- [React Docs](https://react.dev)
- [React Context](https://react.dev/reference/react/useContext)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React + TypeScript](https://react-typescript-cheatsheet.netlify.app)

## 📞 Support

### Before Asking for Help

1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) troubleshooting section
2. Review [SUPABASE_SETUP.md](SUPABASE_SETUP.md) configuration
3. Check browser console for error messages
4. Verify .env.local has correct credentials

### Common Issues

| Issue                 | Solution                                 |
| --------------------- | ---------------------------------------- |
| env vars not working  | Restart dev server after .env changes    |
| room not saving       | Check admin_profiles table exists        |
| realtime not updating | Verify realtime enabled for table        |
| can't login           | Check email provider enabled in Supabase |
| build fails           | Run `npm run lint` to check for errors   |

## 🎉 Next Steps

### Immediate

1. Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to configure Supabase
2. Run `npm run dev` and test admin signup
3. Create a test room and verify it appears in Supabase

### Short Term (Phase 3)

- Implement player join flow
- Create waiting lobby
- Set up player presence tracking
- Test with multiple players

### Medium Term (Phase 4)

- Sync timers across players
- Implement challenge completion
- Calculate progress
- Detect winners

### Long Term (Phase 5)

- Live leaderboard updates
- Player presence UI
- Automatic game end
- Tiebreaker logic

## 📝 Notes

### Development Approach

- Build incrementally with real Supabase data
- Test each phase thoroughly before next
- Keep localStorage as offline fallback
- Document as you build

### Code Quality

- TypeScript for type safety
- Error handling everywhere
- Cleanup subscriptions
- Avoid race conditions

### Performance

- Load data once when needed
- Unsubscribe from realtime when done
- Batch state updates
- Use React.memo for expensive components

---

**Start Here**: [PHASE_1_2_SUMMARY.md](PHASE_1_2_SUMMARY.md)
**Then Setup**: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
**Then Code**: [PHASE_3_GUIDE.md](PHASE_3_GUIDE.md)

**Happy coding! 🎮**
