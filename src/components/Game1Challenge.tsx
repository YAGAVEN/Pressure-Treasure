import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import gameHtml from '@/data/game1.html?raw';
import gameCss from '@/data/game1.css?raw';
import gameJs from '@/data/game1.js?raw';

interface Game1ChallengeProps {
  onComplete: () => void;
  onCancel?: () => void;
}

const ASSET_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bbackground\.png\b/g, '/images/background.jpg'],
  [/\bcastle\.jpg\b/g, '/images/background2.jpg'],
];

const rewriteAssets = (content: string) =>
  ASSET_REPLACEMENTS.reduce((updated, [pattern, replacement]) => {
    return updated.replace(pattern, replacement);
  }, content);

const extractBody = (html: string) => {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = match ? match[1] : html;
  return bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
};

export const Game1Challenge = ({ onComplete, onCancel }: Game1ChallengeProps) => {
  console.log('[GAME1CHALLENGE] Component rendering');
  const completedRef = useRef(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const scopedCss = useMemo(() => rewriteAssets(gameCss), []);
  const scopedBody = useMemo(() => rewriteAssets(extractBody(gameHtml)), []);
  const scopedJs = useMemo(() => rewriteAssets(gameJs), []);
  const srcDoc = useMemo(() => {
    console.log('[GAME1CHALLENGE] Building srcDoc');
    const doc = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${scopedCss}</style>
        </head>
        <body>
          ${scopedBody}
          <script>${scopedJs}</script>
          <script>
            console.log('[GAME1] Iframe loaded and initialized');
            window.addEventListener('proceedToStage2', () => {
              console.log('[GAME1] proceedToStage2 event received');
              parent.postMessage({ type: 'game1Completed' }, '*');
            });
          </script>
        </body>
      </html>
    `;
    console.log('[GAME1CHALLENGE] srcDoc built successfully');
    return doc;
  }, [scopedCss, scopedBody, scopedJs]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('[GAME1CHALLENGE] Message received:', event.data, 'from:', event.origin);
      if (event.source !== frameRef.current?.contentWindow) {
        console.log('[GAME1CHALLENGE] ❌ Message not from game iframe, ignoring');
        return;
      }
      if (event.data?.type !== 'game1Completed' || completedRef.current) {
        console.log('[GAME1CHALLENGE] ❌ Not a completion message or already completed', event.data?.type, 'completed:', completedRef.current);
        return;
      }
      // DISABLED FOR TESTING - Accept completion even without fullscreen
      /* if (!document.fullscreenElement) {
        // Ignore completion events while not fullscreen
        return;
      } */
      console.log('[GAME1CHALLENGE] ✅ Game completed! Calling onComplete in 1.2s');
      completedRef.current = true;
      setTimeout(() => {
          onComplete();
        }, 1200);
      // onComplete();
    };

    console.log('[GAME1CHALLENGE] Setting up message listener');
    window.addEventListener('message', handleMessage);
    return () => {
      console.log('[GAME1CHALLENGE] Removing message listener');
      window.removeEventListener('message', handleMessage);
    };
  }, [onComplete]);

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
      // Retry after user interaction
    }
  };

  return (
    <div className="min-h-screen bg-medieval-pattern">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <span className="font-cinzel text-lg font-bold text-primary">I</span>
            </div>
            <div>
              <p className="font-cinzel font-semibold">Trial of the First Men</p>
              <p className="text-xs text-muted-foreground">Challenge 1</p>
            </div>
          </div>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Back
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="font-cinzel text-2xl text-center">
                Trial of the First Men
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Complete the memory trial to prove your worth and advance.
              </p>
            </CardContent>
          </Card>

          <div className="relative rounded-xl border border-border/60 bg-background/60 p-3 shadow-sm">
            <iframe
              title="Trial of the First Men"
              srcDoc={srcDoc}
              ref={frameRef}
              onLoad={() => console.log('[GAME1CHALLENGE] ✅ Iframe loaded successfully')}
              onError={(e) => console.error('[GAME1CHALLENGE] ❌ Iframe error:', e)}
              className={cn(
                'game1-surface h-[720px] w-full rounded-lg border-0'
                /* DISABLED FOR TESTING: !isFullscreen && 'pointer-events-none' */
              )}
            />

            {/* FULLSCREEN OVERLAY DISABLED FOR TESTING */}
            {/* {!isFullscreen && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/90 backdrop-blur">
                <div className="text-center space-y-4 p-6">
                  <p className="font-semibold text-lg">Fullscreen Required</p>
                  <p className="text-sm text-muted-foreground">You must be in fullscreen to play. Click the button below to enter fullscreen.</p>
                  <div className="mt-2">
                    <Button onClick={enterFullscreen}>Enter Fullscreen</Button>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </main>

      <style>{`
        .game1-surface {
          position: relative;
          min-height: 720px;
          background: #0a0f1e;
        }
      `}</style>
    </div>
  );
};
