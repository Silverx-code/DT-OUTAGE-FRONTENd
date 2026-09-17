"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Role, UserSummary } from "@/lib/types";
import { Icon } from "./icon";

type TourStep = { title: string; text: string; route: string; target: string };
const ROLE_INFO: Record<Role, { name: string; description: string }> = {
  USER: { name: "Field User", description: "You can report transformer outages and record restorations for your operational work." },
  PAT: { name: "PAT — Reporting & Analytics", description: "You have read-only access to all submitted outage data. You can filter and sort records across business units." },
  ADMIN: { name: "Administrator", description: "You can manage users, populate transformer and lookup data, and supervise operational outage activity." },
  SUPERADMIN: { name: "Super Administrator", description: "You have full administration access, including user roles, master data, and operational oversight." },
};

const STEPS: Record<Role, TourStep[]> = {
  USER: [
    { title: "Live dashboard", text: "Monitor active outages, restoration totals, and the oldest open fault.", route: "/dashboard", target: "dashboard-summary" },
    { title: "Report an outage", text: "Search for the transformer, describe the fault, and submit the report. The system prevents duplicate active reports.", route: "/report-outage", target: "report-form" },
    { title: "Restore a transformer", text: "Select an active outage, enter the restoration time and remarks, then confirm the restoration.", route: "/restore-dt", target: "restore-form" },
    { title: "Review history", text: "Search active and restored records to follow the history of submitted faults.", route: "/outages", target: "outage-directory" },
  ],
  PAT: [
    { title: "Live dashboard", text: "See system-wide outage totals, ageing, and active transformer faults.", route: "/dashboard", target: "dashboard-summary" },
    { title: "Filter submitted data", text: "Use search, status, business-unit, and fault filters to focus the outage dataset.", route: "/outages", target: "outage-directory" },
    { title: "Arrange the data", text: "Sort by date, age, transformer, or status. Use the arrow to reverse the order.", route: "/outages", target: "outage-directory" },
  ],
  ADMIN: [
    { title: "Operational view", text: "Monitor your live outage dashboard and review the current operational position.", route: "/dashboard", target: "dashboard-summary" },
    { title: "Manage users", text: "Add approved Gridline users and assign the appropriate role from Access Control.", route: "/access-control", target: "access-control" },
    { title: "Populate reference data", text: "Add transformers, fault categories, and restoration challenges in Data Management.", route: "/data-management", target: "data-management" },
    { title: "Review submitted faults", text: "Search, filter, and sort all submitted outage records in the Outage Directory.", route: "/outages", target: "outage-directory" },
  ],
  SUPERADMIN: [],
};

export function OnboardingTour() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [phase, setPhase] = useState<"role" | "tour">("role");
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [spotlight, setSpotlight] = useState<DOMRect | null>(null);
  const steps = useMemo(() => user ? (user.role === "SUPERADMIN" ? [{ title: "Full system view", text: "You have the complete Gridline administration and operations toolset.", route: "/dashboard", target: "dashboard-summary" }, ...STEPS.ADMIN] : STEPS[user.role]) : [], [user]);

  useEffect(() => {
    if (user || pathname !== "/dashboard") return;
    api.get<UserSummary>("/me").then((current) => { setUser(current); if (window.localStorage.getItem("gridline-onboarding-complete") !== "true") setOpen(true); }).catch(() => undefined);
    const reopen = () => { setPhase("role"); setStep(0); setOpen(true); };
    window.addEventListener("gridline-open-tutorial", reopen);
    return () => window.removeEventListener("gridline-open-tutorial", reopen);
  }, [pathname, user]);

  useEffect(() => {
    if (!open || phase !== "tour" || !steps[step]) return;
    if (pathname !== steps[step].route) { router.push(steps[step].route); return; }
    const timer = window.setTimeout(() => setSpotlight(document.querySelector(`[data-tutorial="${steps[step].target}"]`)?.getBoundingClientRect() ?? null), 150);
    return () => window.clearTimeout(timer);
  }, [open, phase, pathname, router, step, steps]);

  if (!open || !user) return null;
  const finish = () => { window.localStorage.setItem("gridline-onboarding-complete", "true"); setOpen(false); setSpotlight(null); };
  const next = () => { if (phase === "role") { setPhase("tour"); setStep(0); return; } if (step === steps.length - 1) finish(); else setStep(step + 1); };
  const active = phase === "tour" ? steps[step] : null;
  return <div className="fixed inset-0 z-[60] bg-black/35">
    {spotlight && <div className="pointer-events-none fixed rounded-xl border-4 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" style={{ top: spotlight.top - 6, left: spotlight.left - 6, width: spotlight.width + 12, height: spotlight.height + 12 }} />}
    <div className="fixed bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2 text-primary"><Icon name={phase === "role" ? "badge" : "explore"} size={22} /><span className="text-label-lg font-bold">{phase === "role" ? "Your Gridline role" : "Gridline tutorial"}</span></div><button onClick={finish} className="text-label-sm text-on-surface-variant">Skip</button></div>
      {phase === "role" ? <><p className="text-label-sm uppercase tracking-widest text-on-surface-variant">Welcome, {user.fullName}</p><h2 className="mt-2 text-headline-md font-bold">{ROLE_INFO[user.role].name}</h2><p className="mt-2 text-body-md leading-relaxed text-on-surface-variant">{ROLE_INFO[user.role].description}</p></> : <><p className="text-label-sm uppercase tracking-widest text-on-surface-variant">Step {step + 1} of {steps.length}</p><h2 className="mt-2 text-headline-md font-bold">{active?.title}</h2><p className="mt-2 text-body-md leading-relaxed text-on-surface-variant">{active?.text}</p><div className="mt-5 flex gap-1.5">{steps.map((_, index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-surface-container"}`} />)}</div></>}
      <button onClick={next} className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-primary text-label-md font-bold text-on-primary">{phase === "role" ? "Show me around" : step === steps.length - 1 ? "Finish tutorial" : "Next"}</button>
    </div>
  </div>;
}
