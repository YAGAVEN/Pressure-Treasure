# 🎮 Pressure & Treasure

A multi-player interactive game platform featuring multiple challenge-based mini-games with real-time synchronization. Players compete through various puzzle challenges, riddles, and brain teasers in an engaging, pressure-filled environment.

## ✨ Features

- 🎯 **Multiple Game Modes**: Five unique challenge games including riddles, puzzles, and interactive challenges
- 👥 **Multi-player Support**: Real-time player synchronization and admin controls
- 🎨 **Modern UI**: Beautiful interface built with shadcn-ui and Tailwind CSS
- 🎬 **Smooth Animations**: Engaging animations powered by Framer Motion
- 🔊 **Background Music**: Immersive audio experience
- 📱 **Responsive Design**: Works seamlessly across desktop and mobile devices
- ⚡ **Real-time Updates**: Live game state synchronization using Supabase
- 🎭 **Admin Dashboard**: Comprehensive game management and player monitoring
- 🏆 **Winner Tracking**: Automatic winner detection and celebration screens

## 🎮 Game Modes

1. **Game 1**: HTML/CSS/JS based challenge
2. **Riddle Challenge**: Brain-teasing riddles with multiple difficulty levels
3. **Game 3**: Interactive puzzle game
4. **Game 4**: Multi-level challenge progression
5. **Game 5**: Story-based challenge experience

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui (Radix UI)
- **Backend & Database**: Supabase
- **Real-time**: Supabase Real-time subscriptions
- **State Management**: React Context + Hooks
- **Animations**: Framer Motion
- **Routing**: React Router
- **Form Handling**: React Hook Form + Zod
- **Data Fetching**: TanStack Query (React Query)
- **Testing**: Vitest

## 📋 Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or bun package manager
- Supabase account (free tier available)

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/pressure-treasure.git
cd pressure-treasure
```

2. **Install dependencies**

```bash
npm install
# or
bun install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note**: Get your Supabase credentials from your Supabase project dashboard under Settings > API

4. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🗄️ Database Setup

This project uses Supabase as the backend. You'll need to set up the following tables in your Supabase project:

- `players` - Player information and game state
- `rooms` - Game room management
- Additional tables based on your specific game requirements

Refer to your Supabase dashboard to create these tables or use the Supabase CLI for migrations.

## 🎯 Usage

### For Players

1. Navigate to the player join page
2. Enter your name and room code
3. Wait for the admin to start the game
4. Complete challenges and compete with other players

### For Admins

1. Access the admin dashboard
2. Create or manage game rooms
3. Monitor player progress in real-time
4. Control game flow and advance levels

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

Watch mode for development:

```bash
npm run test:watch
```

## 📦 Building for Production

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard

### Other Platforms

The built application is a static site in the `dist` folder. You can deploy it to any static hosting service (GitHub Pages, Cloudflare Pages, etc.).

**Important**: Always configure your environment variables in your hosting platform's settings before deployment.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.

---

Made with ❤️ by the Pressure & Treasure Team
