"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { initializeMsal } from "@/lib/msal";

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    void initializeMsal().then((account) => {
      if (account && pathname === "/login") router.replace("/dashboard");
      if (!account && pathname !== "/login") router.replace("/login");
    }).catch((error) => console.error("Microsoft Entra initialization failed", error));
  }, [pathname, router]);

  useEffect(() => {
    const handleUnauthorized = () => {
      if (pathname !== "/login") router.replace("/login?reason=session-expired");
    };
    window.addEventListener("gridline-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("gridline-unauthorized", handleUnauthorized);
  }, [pathname, router]);

  return children;
}
