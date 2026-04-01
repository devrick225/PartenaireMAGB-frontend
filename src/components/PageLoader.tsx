import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = 'Chargement...' }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border p-6 space-y-3 animate-pulse">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-7 w-28 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-4 animate-pulse">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-muted/60 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
