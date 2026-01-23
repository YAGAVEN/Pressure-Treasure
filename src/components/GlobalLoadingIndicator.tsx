import { useLoading } from '@/contexts/LoadingContext';
import { Loader } from 'lucide-react';

export function GlobalLoadingIndicator() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-white font-medium">Loading...</p>
      </div>
    </div>
  );
}
