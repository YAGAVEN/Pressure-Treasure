import React, { useEffect, useState } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { GAME_WIDTH, GAME_HEIGHT, LEVEL_NAMES } from '@/data/game3Constants';
import { Button } from '@/components/ui/button';

interface Game3Props {
  onComplete?: () => void;
  onCancel?: () => void;
}

const Game3: React.FC<Game3Props> = ({ onComplete, onCancel }) => {
  const { canvasRef, engineState, startGame, nextLevel, restartGame } = useGameEngine();
  const { gameState } = engineState;

  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => !!(typeof document !== 'undefined' && document.fullscreenElement));

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const enterFullscreen = async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).mozRequestFullScreen) {
        await (el as any).mozRequestFullScreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      } else if ((el as any).msRequestFullscreen) {
        await (el as any).msRequestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen request failed:', err);
    }
  };

  // Handle game completion
  useEffect(() => {
    if (gameState.gameComplete && onComplete) {
      if (document.fullscreenElement) {
        onComplete();
      } else {
        // ignore completion until fullscreen is active
      }
    }
  }, [gameState.gameComplete, onComplete]);
  
  return (
    <div className="relative flex items-center justify-center bg-[#0a0a0f] min-h-screen">
      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="border-4 border-[#3a3a4a] rounded-lg shadow-2xl"
          style={{ imageRendering: 'pixelated' }}
        />

        {!isFullscreen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-black/80">
            <div className="text-center space-y-4 p-6">
              <p className="font-semibold text-2xl text-white">Fullscreen Required</p>
              <p className="text-sm text-muted-foreground">You must be in fullscreen to play. Click below to enter fullscreen.</p>
              <div className="mt-2">
                <Button onClick={enterFullscreen}>Enter Fullscreen</Button>
              </div>
            </div>
          </div>
        )}
        
        {/* HUD */}
        {gameState.isPlaying && !gameState.levelComplete && !gameState.gameComplete && (
          <div className="absolute top-4 left-4 text-white font-mono">
            <div className="bg-black/70 px-4 py-2 rounded border border-[#4a4a5a]">
              <p className="text-sm text-[#a8a8b8]">Level {gameState.currentLevel}</p>
              <p className="text-xs text-[#888898]">{LEVEL_NAMES[gameState.currentLevel - 1]}</p>
            </div>
          </div>
        )}
        
        {gameState.isPlaying && !gameState.levelComplete && (
          <div className="absolute top-4 right-4 text-white font-mono">
            <div className="bg-black/70 px-4 py-2 rounded border border-[#4a4a5a]">
              <p className="text-sm text-[#ff6b6b]">Deaths: {gameState.deaths}</p>
            </div>
          </div>
        )}
        
        {/* Start Screen */}
        {gameState.showStartScreen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-[#c9a959] mb-2 font-serif tracking-wider">
                TRAP ADVENTURES
              </h1>
              <h2 className="text-2xl text-[#8b7355] mb-8 font-serif">
                The Iron Path
              </h2>
              
              <div className="mb-8 text-[#a8a8b8] text-sm space-y-1">
                <p>⚔️ Navigate deadly traps</p>
                <p>❄️ Survive the frozen north</p>
                <p>🗡️ Cross the castle of blades</p>
                <p>🔥 Face the fire trial</p>
              </div>
              
              <div className="mb-6 text-[#6a6a7a] text-xs">
                <p>Controls: Arrow Keys or WASD to move</p>
                <p>Space or W/Up to jump</p>
              </div>
              
              <Button 
                onClick={() => isFullscreen ? startGame() : enterFullscreen()}
                className="bg-[#8b0000] hover:bg-[#a00000] text-white px-8 py-3 text-lg font-serif border-2 border-[#c9a959]"
              >
                {isFullscreen ? 'BEGIN YOUR TRIAL' : 'Enter Fullscreen to Begin'}
              </Button>
            </div>
          </div>
        )}
        
        {/* Level Complete Screen */}
        {gameState.levelComplete && !gameState.gameComplete && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-[#ffd700] mb-4 font-serif">
                LEVEL {gameState.currentLevel} COMPLETE
              </h2>
              <p className="text-xl text-[#a8a8b8] mb-2">
                {LEVEL_NAMES[gameState.currentLevel - 1]}
              </p>
              <p className="text-[#888898] mb-8">
                Deaths: {gameState.deaths}
              </p>
              
              {gameState.currentLevel < 3 ? (
                <>
                  <p className="text-[#c9a959] mb-6 font-serif">
                    Prepare for the next challenge...
                  </p>
                  <Button 
                    onClick={nextLevel}
                    className="bg-[#8b0000] hover:bg-[#a00000] text-white px-8 py-3 text-lg font-serif border-2 border-[#c9a959]"
                  >
                    NEXT LEVEL
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={nextLevel}
                  className="bg-[#ffd700] hover:bg-[#ffed4a] text-black px-8 py-3 text-lg font-serif border-2 border-[#8b7355]"
                >
                  CLAIM VICTORY
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Game Complete Screen */}
        {gameState.gameComplete && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-[#ffd700] mb-4 font-serif tracking-wider">
                VICTORY!
              </h1>
              <h2 className="text-2xl text-[#c9a959] mb-6 font-serif">
                You have conquered The Iron Path
              </h2>
              
              <div className="bg-[#1a1a2e] border-2 border-[#4a4a5a] rounded-lg p-6 mb-8">
                <p className="text-[#a8a8b8] text-lg mb-2">Final Statistics</p>
                <p className="text-3xl text-[#ff6b6b] font-bold">{gameState.deaths}</p>
                <p className="text-[#888898] text-sm">Total Deaths</p>
              </div>
              
              <p className="text-[#6a6a7a] italic mb-6 font-serif">
                "When you play the game of traps, you die or you die again."
              </p>
              
              <Button 
                onClick={restartGame}
                className="bg-[#8b0000] hover:bg-[#a00000] text-white px-8 py-3 text-lg font-serif border-2 border-[#c9a959]"
              >
                PLAY AGAIN
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game3;
