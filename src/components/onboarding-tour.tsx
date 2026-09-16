"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icon";

const STEPS = [
  ["Dashboard", "See active outages, restored transformers, ageing, and operational priorities."],
  ["Report outage", "Report a transformer outage with its location, fault category, and supporting details."],
  ["Restore DT", "Find an active outage and record the restoration time, remarks, and challenge details."],
  ["Outages", "Search current and historical outage records and review restoration history."],
  ["Access Control", "Admins and SuperAdmins can add approved users and manage their roles."],
] as const;

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(window.localStorage.getItem("gridline-onboarding-complete") !== "true");
  }, []);

  if (!open) return null;
  const finish = () => { window.localStorage.setItem("gridline-onboarding-complete", "true"); setOpen(false); };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2 text-primary"><Icon name="explore" size={22} /><span className="text-label-lg font-bold">Welcome to Gridline</span></div><button onClick={finish} className="text-label-sm text-on-surface-variant">Skip</button></div>
        <p className="text-label-sm uppercase tracking-widest text-on-surface-variant">Getting started {step + 1} of {STEPS.length}</p>
        <h2 className="mt-2 text-headline-sm font-bold text-on-surface">{STEPS[step][0]}</h2>
        <p className="mt-2 text-body-md leading-relaxed text-on-surface-variant">{STEPS[step][1]}</p>
        <div className="mt-6 flex gap-1.5">{STEPS.map((_, index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-surface-container"}`} />)}</div>
        <button onClick={() => step === STEPS.length - 1 ? finish() : setStep(step + 1)} className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-primary text-label-md font-bold text-on-primary">{step === STEPS.length - 1 ? "Start using Gridline" : "Next"}</button>
      </div>
    </div>
  );
}
