"use client";

type LoadingScreenProps = {
  label?: string;
  className?: string;
};

export function LoadingScreen({ label = "Loading…", className = "" }: LoadingScreenProps) {
  return (
    <div
      className={`min-h-screen bg-background flex flex-col items-center justify-center gap-8 p-6 ${className}`}
      aria-live="polite"
      aria-busy="true"
    >
      {/* Animated pulse rings + center dot */}
      <div className="relative flex items-center justify-center w-24 h-24">
        <span
          className="absolute inset-0 rounded-full bg-primary/20 animate-loading-ping"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="absolute inset-0 rounded-full bg-primary/25 animate-loading-ping"
          style={{ animationDelay: "200ms" }}
        />
        <span
          className="absolute inset-0 rounded-full bg-primary/30 animate-loading-ping"
          style={{ animationDelay: "400ms" }}
        />
        <span className="relative w-10 h-10 rounded-full bg-primary/90 shadow-lg shadow-primary/30 animate-loading-pulse" />
      </div>

      {/* Label + shimmer line */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 rounded-full bg-primary animate-loading-shimmer" />
        </div>
      </div>
    </div>
  );
}
