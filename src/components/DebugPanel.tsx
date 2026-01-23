import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { analytics } from '@/lib/analytics';
import { Copy, DownloadCloud, Trash2 } from 'lucide-react';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { rooms, currentPlayer, getPlayersInRoom } = useGame();
  const events = analytics.getEvents();
  const playersInRoom = currentPlayer ? getPlayersInRoom(currentPlayer.roomCode) : [];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-10 w-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center text-xs font-bold text-primary cursor-pointer z-40"
        title="Debug Panel"
      >
        🐛
      </button>
    );
  }

  const handleExport = () => {
    const json = analytics.exportAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-${Date.now()}.json`;
    a.click();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 z-40 overflow-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm">Debug Panel</CardTitle>
            <CardDescription>Game state & events</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            ✕
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* State Summary */}
          <div>
            <p className="font-bold mb-1">State</p>
            <div className="space-y-0.5 text-muted-foreground">
              <p>Rooms: {rooms.length}</p>
              <p>Players in Room: {playersInRoom.length}</p>
              <p>Current Player: {currentPlayer?.username || 'None'}</p>
              <p>Events: {events.length}</p>
            </div>
          </div>

          {/* Current Player */}
          {currentPlayer && (
            <div>
              <p className="font-bold mb-1">Current Player</p>
              <div className="bg-muted p-2 rounded text-muted-foreground space-y-0.5">
                <p>ID: {currentPlayer.id.slice(0, 8)}...</p>
                <p>Progress: {currentPlayer.progress}%</p>
                <p>Challenge: {currentPlayer.currentChallenge}</p>
                <p>Online: {currentPlayer.isOnline ? '✓' : '✗'}</p>
              </div>
            </div>
          )}

          {/* Recent Events */}
          <div>
            <p className="font-bold mb-1">Recent Events ({events.length})</p>
            <div className="bg-muted p-2 rounded max-h-32 overflow-auto space-y-1">
              {events.slice(-5).map((event, i) => (
                <div key={i} className="text-muted-foreground flex justify-between text-xs">
                  <span>{event.name}</span>
                  <span className="opacity-50">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {events.length === 0 && <p className="text-muted-foreground">No events</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex-1 h-7 text-xs gap-1"
            >
              <DownloadCloud className="h-3 w-3" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                analytics.clear();
              }}
              className="flex-1 h-7 text-xs gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          </div>

          {/* Copy State */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              handleCopy(JSON.stringify({ rooms, playersInRoom, currentPlayer }, null, 2))
            }
            className="w-full h-7 text-xs gap-1"
          >
            <Copy className="h-3 w-3" />
            Copy State
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
