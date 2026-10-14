"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Role } from "@/lib/types";
import { Icon } from "./icon";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "grid_view" },
  { path: "/report-outage", label: "Report", icon: "report_problem" },
  { path: "/restore-dt", label: "Restore", icon: "offline_bolt" },
  { path: "/outages", label: "History", icon: "history" },
  { path: "/transformers", label: "Transformers", icon: "electric_meter" },
] as const;

function itemsForRole(role: Role | null) {
  if (role === "PAT") return NAV_ITEMS.filter((item) => ["/dashboard", "/outages", "/transformers"].includes(item.path));
  return NAV_ITEMS;
}

export function BottomNav({ hideMobile = false }: { hideMobile?: boolean }) {
  const pathname = usePathname();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    api.get<{ role: Role }>("/me").then((user) => setRole(user.role)).catch(() => setRole(null));
  }, []);

  const isAdmin = role === "ADMIN" || role === "SUPERADMIN";
  const items = itemsForRole(role);

  return (
    <>
    <nav aria-label="Main navigation" className={`fixed bottom-0 z-50 w-full pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)] lg:hidden ${hideMobile ? "hidden" : ""}`}>
      <div className="flex h-16 items-center justify-between px-gutter">
        {items.map((item) => {
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
        {isAdmin && <Link
          href="/access-control"
          aria-current={pathname?.startsWith("/access-control") ? "page" : undefined}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 py-space-xs transition-colors ${pathname?.startsWith("/access-control") ? "text-primary font-bold" : "text-on-surface-variant"}`}
        >
          <Icon name="admin_panel_settings" size={22} />
          <span className="text-label-sm mt-space-xs">Access</span>
        </Link>}
      </div>
    </nav>
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-outline-variant/50 bg-surface-container-lowest px-4 py-6 lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-xl font-bold text-on-primary">G</span>
        <span><span className="block text-label-md font-bold uppercase tracking-widest text-primary">Gridline</span><span className="text-body-sm text-on-surface-variant">DT Outage Operations</span></span>
      </Link>
      <p className="mb-2 px-3 text-label-sm uppercase tracking-widest text-on-surface-variant">Workspace</p>
      <div className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active = pathname?.startsWith(item.path);
          return <Link key={item.path} href={item.path} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-body-md font-semibold transition-colors ${active ? "bg-primary-fixed text-on-primary-fixed-variant" : "text-on-surface-variant hover:bg-surface-container-low"}`}><Icon name={item.icon} size={20}/>{item.label}</Link>;
        })}
        {isAdmin && <Link href="/access-control" aria-current={pathname?.startsWith("/access-control") ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-body-md font-semibold ${pathname?.startsWith("/access-control") ? "bg-primary-fixed text-on-primary-fixed-variant" : "text-on-surface-variant hover:bg-surface-container-low"}`}><Icon name="admin_panel_settings" size={20}/>Access Control</Link>}
        {isAdmin && <Link href="/data-management" aria-current={pathname?.startsWith("/data-management") ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-body-md font-semibold ${pathname?.startsWith("/data-management") ? "bg-primary-fixed text-on-primary-fixed-variant" : "text-on-surface-variant hover:bg-surface-container-low"}`}><Icon name="database" size={20}/>Data Management</Link>}
      </div>
      <Link href="/profile" className={`flex items-center gap-3 rounded-xl px-3 py-3 ${pathname === "/profile" ? "bg-primary-fixed text-on-primary-fixed-variant" : "text-on-surface-variant hover:bg-surface-container-low"}`}><Icon name="person" size={20}/><span className="text-body-md font-semibold">My Profile</span></Link>
    </aside>
    </>
  );
}
