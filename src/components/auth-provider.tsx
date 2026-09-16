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
    }).catch((error) => console.error("Microsoft Entra initialization failed", error));
  }, [pathname, router]);

  return children;
}
