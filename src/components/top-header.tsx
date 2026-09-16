import { Icon } from "./icon";

interface TopHeaderProps {
  title: string;
  subtitle: string;
}

export function TopHeader({ title, subtitle }: TopHeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 px-gutter flex flex-col justify-center gap-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-label-sm text-primary uppercase tracking-wider">
              Online - Synced
            </span>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" size={18} className="text-on-primary" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-headline-md text-on-surface leading-none">
              {title}
            </h1>
            <span className="text-label-sm text-on-surface-variant font-medium">
              {subtitle}
            </span>
          </div>
          <button
            aria-label="Emergency signal"
            className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-surface-container-high text-secondary hover:bg-surface-container-highest transition-colors"
          >
            <Icon name="warning" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
