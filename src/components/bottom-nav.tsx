"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "grid_view" },
  { path: "/report-outage", label: "Report", icon: "report_problem" },
  { path: "/restore-dt", label: "Restore", icon: "offline_bolt" },
  { path: "/outages", label: "History", icon: "history" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-center h-16 px-gutter">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 py-space-xs transition-colors ${
                active ? "text-primary font-bold" : "text-on-surface-variant"
              }`}
            >
              <Icon name={item.icon} size={22} />
              <span className="text-label-sm mt-space-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
