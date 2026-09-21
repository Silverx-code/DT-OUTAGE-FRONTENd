"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("gridline_token"); const publicRoute = ["/login", "/forgot-password", "/reset-password"].includes(pathname);
    if (!token && !publicRoute) router.replace("/login"); if (token && pathname === "/login") router.replace("/dashboard");
  }, [pathname, router]);

  useEffect(() => {
    const handleUnauthorized = () => {
      sessionStorage.removeItem("gridline_token"); if (pathname !== "/login") router.replace("/login?reason=session-expired");
    };
    window.addEventListener("gridline-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("gridline-unauthorized", handleUnauthorized);
  }, [pathname, router]);

  return children;
}
