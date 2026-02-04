import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/contexts/GameContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalLoadingIndicator } from "@/components/GlobalLoadingIndicator";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import { DebugPanel } from "@/components/DebugPanel";
import Index from "./pages/Index";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import PlayerJoin from "./pages/PlayerJoin";
import PlayerGame from "./pages/PlayerGame";
import RiddlePage from "./pages/RiddlePage";
import Game1Page from "./pages/Game1Page";
import Game4Page from "./pages/Game4Page";
import Game3Page from "./pages/Game3Page";
import Game5Page from "./pages/Game5Page";
import WinnerPage from "./pages/WinnerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <TooltipProvider>
          <GameProvider>
            <Toaster />
            <Sonner />
            <GlobalLoadingIndicator />
            <NetworkStatusIndicator />
            {import.meta.env.DEV && <DebugPanel />}
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin/auth" element={<AdminAuth />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/join" element={<PlayerJoin />} />
                <Route path="/game/:roomCode" element={<PlayerGame />} />
                <Route path="/game1/:roomCode" element={<Game1Page />} />
                <Route path="/riddle/:roomCode" element={<RiddlePage />} />
                <Route path="/game4/:roomCode" element={<Game4Page />} />
                <Route path="/game3/:roomCode" element={<Game3Page />} />
                <Route path="/game5/:roomCode" element={<Game5Page />} />
                <Route path="/winner/:roomCode" element={<WinnerPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </GameProvider>
        </TooltipProvider>
      </LoadingProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
