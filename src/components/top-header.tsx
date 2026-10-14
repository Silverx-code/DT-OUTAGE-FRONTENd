interface TopHeaderProps {
  title: string;
  subtitle: string;
}

export function TopHeader({ title, subtitle }: TopHeaderProps) {
  return (
    <header className="fixed top-0 z-40 w-full pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] lg:left-64 lg:w-[calc(100%-16rem)]">
      <div className="flex min-h-20 items-center px-gutter py-3">
          <div className="flex flex-col">
            <h1 className="text-headline-md text-on-surface leading-none">
              {title}
            </h1>
            <span className="text-label-sm text-on-surface-variant font-medium">
              {subtitle}
            </span>
          </div>
      </div>
    </header>
  );
}
