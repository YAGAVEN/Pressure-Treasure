import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const BackgroundMusic = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start with sound ON
    video.muted = false;

    // Try to autoplay with sound
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          // Autoplay with sound was prevented
          // Try playing muted as fallback
          console.log('Autoplay with sound prevented, trying muted:', error);
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => {
            console.log('Even muted autoplay failed');
          });
        });
    }

    return () => {
      if (video) {
        video.pause();
      }
    };
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      // If not playing, start playing
      if (!isPlaying) {
        video.play().then(() => setIsPlaying(true));
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  return (
    <>
      <video
        ref={videoRef}
        src="/intro-video.mp4"
        loop
        autoPlay
        playsInline
        style={{ display: 'none' }}
      />
      <Button
        variant="outline"
        size="icon"
        onClick={toggleMute}
        className={cn(
          "fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg transition-all hover:scale-110",
          isMuted ? "bg-muted" : "bg-background border-primary/50"
        )}
        title={isMuted ? "Unmute music" : "Mute music"}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5 text-primary" />
        )}
      </Button>
    </>
  );
};
