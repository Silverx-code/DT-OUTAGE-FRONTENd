"use client";

import { useRouter } from "next/navigation";
import { Icon } from "./icon";

interface TopHeaderProps {
  title: string;
  subtitle: string;
}

export function TopHeader({ title, subtitle }: TopHeaderProps) {
  const router = useRouter();
  function logOut() {
    sessionStorage.removeItem("gridline_token");
    router.replace("/login");
  }

  return (
    <header className="fixed top-0 z-40 w-full pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] lg:left-64 lg:w-[calc(100%-16rem)]">
      <div className="flex min-h-20 items-center justify-between gap-3 px-gutter py-3">
          <div className="flex flex-col">
            <h1 className="text-headline-md text-on-surface leading-none">
              {title}
            </h1>
            <span className="text-label-sm text-on-surface-variant font-medium">
              {subtitle}
            </span>
          </div>
          <button type="button" onClick={logOut} className="flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-label-sm font-bold text-on-surface-variant hover:bg-surface-container-low" aria-label="Log out">
            <Icon name="logout" size={18} />
            <span>Log out</span>
          </button>
      </div>
    </header>
  );
}
