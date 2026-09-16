import { ReactNode } from "react";
import { TopHeader } from "./top-header";
import { BottomNav } from "./bottom-nav";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Hide the bottom tab bar, e.g. on admin-only screens reached by drill-down. */
  hideNav?: boolean;
}

export function AppShell({ title, subtitle, children, hideNav }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <TopHeader title={title} subtitle={subtitle} />
      <main
        className={`flex flex-col relative w-full pt-20 bg-surface min-h-screen ${
          hideNav ? "pb-8" : "pb-20"
        }`}
      >
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
