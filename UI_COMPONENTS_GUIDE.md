# UI Components & Features Guide

## Overview

The Pressure Treasure application uses React with TypeScript and shadcn/ui components, styled with Tailwind CSS. The design follows a Game of Thrones medieval fantasy aesthetic with dark theme and gold (#d4af37) accents.

---

## Page Components

### 1. AdminAuth.tsx - Admin Login/Registration

**Purpose**: Secure authentication for game masters

**Features**:

- Email/password login
- Account creation with validation
- Secure Supabase authentication
- Remember me functionality
- Password strength validation (min 8 characters)
- Email format validation

**UI Components Used**:

- Input (email, password)
- Button (primary, secondary)
- Card (form container)
- Icons (Shield, Mail, Lock)

**User Flow**:

1. Enter email and password
2. Click "Sign In" or "Create Account"
3. Supabase validates credentials
4. Redirected to AdminDashboard on success

---

### 2. AdminDashboard.tsx - Room Management

**Purpose**: Game master controls room creation and gameplay

**Features**:

- Create new rooms with custom settings
- View all created rooms in grid layout
- Copy room codes to clipboard
- Monitor player list and progress
- Start/End/Reset games
- Kick players from rooms
- Real-time player status display

**UI Components Used**:

- Dialog (create room form)
- Card (room display)
- Button (control buttons)
- Select (house theme, timer)
- Input, Textarea (room info)
- Badge (room status)
- Table-like (player list)

**Room Creation Dialog**:

```
- Room Name: text input
- Description: textarea
- House Theme: dropdown (8 options)
- Timer Duration: dropdown (5-60 minutes)
- [Cancel] [Create Room]
```

**Room Cards** show:

- Room name and house theme
- 6-character room code (copy button)
- Player count and timer display
- Current players with progress percentages
- Winner announcement (if finished)
- Control buttons:
  - Start (waiting status)
  - End Game (playing status)
  - Reset (finished status)

**Status Indicators**:

- 🟢 Waiting (cyan border)
- 🟡 Playing (gold border, gold timer)
- 🔴 Finished (muted border, archived)

---

### 3. PlayerJoin.tsx - Room Entry Point

**Purpose**: Players join games using room codes

**Features**:

- Room code input with 6-character validation
- Username input with length validation (max 20 chars)
- Real-time availability check
- Prevention of joining finished games
- Supabase integration for validation
- Error messages with actionable feedback

**UI Components Used**:

- Input (code, username)
- Button (submit)
- Card (form container)
- Alert (error messages)
- Icons (Crown, Users)

**Form Validation**:

```
Room Code:
- Must be exactly 6 characters
- Alphanumeric only
- Must exist in database

Username:
- 1-20 characters
- Cannot be empty
- Can contain spaces
```

**Error Handling**:

- "Room not found" - code doesn't exist
- "Game is finished" - room no longer accepting players
- "Invalid room code" - format validation failed
- Toast notifications for feedback

---

### 4. Index.tsx - Landing Page

**Purpose**: Main entry point for visitors

**Features**:

- Hero section with game theme
- Navigation to Admin Auth or Player Join
- Feature highlight cards
- Call-to-action buttons
- Responsive design

**UI Elements**:

- Large hero headline
- Description text
- Two primary CTAs
- Feature cards with icons
- Dark medieval theme

---

### 5. PlayerGame.tsx - Main Gameplay Interface

**Purpose**: Main gameplay screen where players complete challenges

**Sections**:

#### A. Header Section

- Room name with house crest
- House name and theme
- Real-time timer (top right)
  - Shows countdown
  - Changes color during gameplay (gold when active)
- Leave button (logout)

#### B. Status Banners

**Waiting Banner**:

```
🔵 Waiting for Game Master
{n} player(s) ready • The hunt begins soon...

Players Joining:
- Player 1 (You)
- Player 2
- Player 3
```

**Victory Banner** (Winner):

```
🏆 Victory!
You have claimed the Iron Throne!
```

**Game Over Banner** (Others):

```
Game Over
{Winner Name} has won the hunt!
```

#### C. Progress Overview Card

- Current progress percentage (large number)
- Progress bar visualization
- Challenge completion count (e.g., "3 of 5 complete")

#### D. Challenges Section

Lists all 5 challenges with:

- Challenge number badge (colored by status)
- Challenge name
- Challenge description
- Status indicators:
  - ✓ Completed (green checkmark, gold background)
  - ⊙ Current (gold border, ring highlight)
  - 🔒 Locked (grayed out, disabled)
- Complete Challenge button
  - Enabled only when challenge is current AND game is playing
  - Disabled during waiting state
  - Shows status: "✓ Completed" or "Waiting for Game Master..."

#### E. Sidebar - Leaderboard

Sticky card showing:

- "Leaderboard" title with Users icon
- "Your rank: #{n} of {total}"
- Player rankings:
  - Rank badge (1, 2, 3, etc)
  - 🥇 1st place background
  - 🥈 2nd place background
  - 🥉 3rd place background
  - • Generic rank for 4+
  - Player name with "(You)" indicator for current player
  - 👑 Crown icon for room winner
  - Progress percentage

**Leaderboard Sorting**: By progress descending (highest first)

**House Motto**: Centered at bottom with decorative styling

---

## UI Component Library

### Core Components

#### Button

```typescript
<Button>Click me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="icon"><Icon /></Button>
<Button disabled>Disabled</Button>
```

#### Card

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

#### Input

```typescript
<Input
  type="email|password|text|number"
  placeholder="Enter value"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  disabled={false}
/>
```

#### Select

```typescript
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Dialog

```typescript
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

#### Progress

```typescript
<Progress value={65} />
```

#### Badge

```typescript
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Error</Badge>
```

#### Alert

```typescript
<Alert>
  <AlertTitle>Title</AlertTitle>
  <AlertDescription>Description</AlertDescription>
</Alert>
```

---

## Styling & Theme

### Color Palette

**Primary Colors**:

- Primary: `#d4af37` (Gold - Game of Thrones theme)
- Primary Foreground: `#000` (Black text on gold)

**Neutrals**:

- Background: `#0a0a0a` (Near black)
- Foreground: `#e4e4e7` (Off white)
- Muted: `#27272a` (Dark gray)
- Muted Foreground: `#a1a1aa` (Light gray)

**Status Colors**:

- Green: `#22c55e` (Success, completed)
- Red: `#ef4444` (Error, danger)
- Yellow: `#eab308` (Warning)
- Blue: `#0ea5e9` (Info)

**House Themes**:
Each house has distinct color:

- Stark: `#1f2937` (Dark gray)
- Lannister: `#fbbf24` (Bright gold)
- Targaryen: `#dc2626` (Red)
- Baratheon: `#1e40af` (Dark blue)
- Greyjoy: `#0369a1` (Teal)
- Tyrell: `#65a30d` (Green)
- Martell: `#ea580c` (Orange)
- Arryn: `#cbd5e1` (Silver)

### Typography

**Fonts**:

- Cinzel (serif) - Headers, titles, Game of Thrones aesthetic
- System font (sans-serif) - Body text, readability

**Font Sizes**:

- `text-5xl` - Main titles
- `text-4xl` - Page headers
- `text-2xl` - Section headers
- `text-xl` - Subsection headers
- `text-lg` - Body text emphasis
- `text-base` - Regular body text
- `text-sm` - Secondary text
- `text-xs` - Helper text

### Spacing

Tailwind spacing scale (0.25rem base):

- `px-4` - Padding horizontal 1rem
- `py-3` - Padding vertical 0.75rem
- `gap-3` - Gap between flex items
- `space-y-2` - Vertical space between children

### Effects

**Shadows**:

- `shadow-sm` - Subtle shadow
- `shadow-md` - Medium shadow
- `shadow-lg` - Large shadow

**Transitions**:

- `transition-all` - Smooth animation
- `transition-colors` - Color-only animation

**Animations**:

- `animate-pulse` - Pulsing effect (waiting state)
- `animate-spin` - Spinning loader

---

## Responsive Design

**Breakpoints** (Tailwind):

- `sm` - 640px+
- `md` - 768px+
- `lg` - 1024px+
- `xl` - 1280px+
- `2xl` - 1536px+

**Responsive Classes**:

```tsx
// Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Hidden on mobile
<div className="hidden md:block">

// Full width mobile, fixed width desktop
<div className="w-full md:w-96">
```

**Mobile Optimizations**:

- Touch-friendly buttons (h-10 w-10 minimum)
- Full-width inputs on mobile
- Vertical layout on mobile, grid on desktop
- Hamburger menu for navigation (if added)

---

## Dark Mode Implementation

The app uses dark mode by default (Game of Thrones aesthetic):

```tsx
// In App.tsx
<div className="dark">{/* All components inherit dark styling */}</div>
```

**Dark Mode Behaviors**:

- Background: Near black (#0a0a0a)
- Text: Off white (#e4e4e7)
- Accent: Gold (#d4af37)
- Reduced opacity for secondary elements
- Sufficient contrast for accessibility

---

## Accessibility Features

**WCAG Compliance**:

- ✓ Semantic HTML (button, form, nav)
- ✓ Color contrast ratios (WCAG AA)
- ✓ Keyboard navigation support
- ✓ ARIA labels on interactive elements
- ✓ Focus indicators visible

**Keyboard Navigation**:

- Tab through interactive elements
- Enter/Space to activate buttons
- Arrow keys in dropdowns
- Escape to close dialogs

**Screen Reader Support**:

```tsx
<button aria-label="Close dialog">×</button>
<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

---

## Animation & Interaction

### Smooth Transitions

```tsx
// Fade in
className = "opacity-0 animate-fade-in";

// Scale up
className = "scale-0 animate-scale-up";

// Slide down
className = "translate-y-[-10px] animate-slide-down";
```

### Interactive States

```tsx
// Hover
className = "hover:bg-primary hover:text-white";

// Focus
className = "focus:outline-none focus:ring-2 focus:ring-primary";

// Active
className = "active:scale-95";

// Disabled
className = "disabled:opacity-50 disabled:cursor-not-allowed";
```

### Waiting/Loading States

```tsx
// Pulsing indicator
<div className="h-3 w-3 rounded-full bg-primary animate-pulse" />

// Spinner
<div className="animate-spin">
  <Loader className="h-4 w-4" />
</div>
```

---

## Form Validation

**Input Validation States**:

```tsx
// Error state
<Input
  className="border-red-500"
  placeholder="Invalid input"
/>
<p className="text-sm text-red-500">Error message</p>

// Success state
<Input
  className="border-green-500"
  placeholder="Valid input"
/>

// Disabled state
<Input
  disabled
  className="opacity-50 cursor-not-allowed"
/>
```

---

## Toast Notifications

**Usage**:

```typescript
const { toast } = useToast();

// Success
toast({
  title: "Success",
  description: "Action completed",
});

// Error
toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
});

// With actions
toast({
  title: "Challenge Complete",
  description: "Moving to next challenge",
  action: <ToastAction altText="Undo">Undo</ToastAction>,
});
```

---

## Custom Utilities

**cn() - Conditional Classes**:

```typescript
import { cn } from '@/lib/utils';

className={cn(
  "base-class",
  isActive && "active-class",
  condition ? "class-a" : "class-b"
)}
```

**formatTime() - Time Display**:

```typescript
import { formatTime } from "@/lib/gameUtils";

formatTime(125); // "2:05" (2 minutes, 5 seconds)
```

**calculateProgress() - Game Progress**:

```typescript
import { calculateProgress } from "@/lib/gameUtils";

calculateProgress([1, 2, 3], 5); // 60 (3 of 5 = 60%)
```

---

## Best Practices

### Component Usage

1. Use semantic components (Button, not div with onClick)
2. Apply variant props for styling
3. Use size prop for spacing (not hardcoded classes)
4. Leverage shadcn/ui provided components

### Styling Guidelines

1. Use Tailwind classes, not CSS files
2. Follow mobile-first responsive design
3. Maintain consistent spacing (gap-3, gap-4)
4. Use color variables from palette above

### Performance

1. Memoize components with useCallback
2. Use React.memo() for expensive renders
3. Avoid inline object/array creation in render
4. Lazy load heavy components (if needed)

### Accessibility

1. Always include alt text for images
2. Use semantic HTML elements
3. Provide ARIA labels for complex UI
4. Test with keyboard navigation
5. Ensure color contrast ratios

---

**Last Updated**: Phase 5 Complete
**Status**: ✅ Production Ready
