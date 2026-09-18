"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { initializeMsal } from "@/lib/msal";

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    void initializeMsal().then((account) => {
      console.info("[auth] Route guard evaluated", {
        pathname,
        authenticated: Boolean(account),
        automaticRedirect: !account && pathname !== "/login" || Boolean(account) && pathname === "/login",
      });
      if (!account) {
        if (pathname !== "/login") router.replace("/login");
        return;
      }
      if (pathname === "/login") router.replace("/dashboard");
    }).catch((error) => console.error("Microsoft Entra initialization failed", error));
  }, [pathname, router]);

  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn("[auth] API unauthorized event received; redirect suppressed", { pathname });
    };
    window.addEventListener("gridline-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("gridline-unauthorized", handleUnauthorized);
  }, [pathname, router]);

  return children;
}
