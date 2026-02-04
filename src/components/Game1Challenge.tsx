import { useEffect, useMemo, useRef } from 'react';
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
  const completedRef = useRef(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const scopedCss = useMemo(() => rewriteAssets(gameCss), []);
  const scopedBody = useMemo(() => rewriteAssets(extractBody(gameHtml)), []);
  const scopedJs = useMemo(() => rewriteAssets(gameJs), []);
  const srcDoc = useMemo(() => {
    return `
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
            window.addEventListener('proceedToStage2', () => {
              parent.postMessage({ type: 'game1Completed' }, '*');
            });
          </script>
        </body>
      </html>
    `;
  }, [scopedCss, scopedBody, scopedJs]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) {
        return;
      }
      if (event.data?.type !== 'game1Completed' || completedRef.current) {
        return;
      }
      completedRef.current = true;
      onComplete();
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onComplete]);

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
              className={cn(
                'game1-surface h-[720px] w-full rounded-lg border-0'
              )}
            />
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
