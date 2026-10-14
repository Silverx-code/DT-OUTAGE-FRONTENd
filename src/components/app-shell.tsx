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
    <div className="min-h-screen bg-surface lg:pl-64">
      <TopHeader title={title} subtitle={subtitle} />
      <main
        className={`relative flex min-h-screen w-full flex-col bg-surface pt-20 ${
          hideNav ? "pb-8" : "pb-20 lg:pb-8"
        }`}
      >
        {children}
      </main>
      <BottomNav hideMobile={hideNav} />
    </div>
  );
}
