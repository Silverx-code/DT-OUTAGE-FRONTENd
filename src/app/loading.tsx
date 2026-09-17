import { Icon } from "@/components/icon";

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-gutter text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg">
        <Icon name="bolt" size={32} filled />
      </div>
      <p className="mt-5 text-label-lg font-bold uppercase tracking-[0.2em] text-primary">Gridline</p>
      <p className="mt-2 text-body-sm text-on-surface-variant">Loading live outage operations…</p>
      <div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-surface-container">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
      <span className="mt-4 flex items-center gap-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Connecting to API
      </span>
    </main>
  );
}
