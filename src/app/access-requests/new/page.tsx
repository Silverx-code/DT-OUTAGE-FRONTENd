"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import type { Role } from "@/lib/types";

const ROLE_OPTIONS: {
  role: Role;
  title: string;
  tier: string;
  desc: string;
  grants: string[];
  warning?: string;
}[] = [
  {
    role: "USER",
    title: "ROLE_USER",
    tier: "Default · Field Staff / Operator",
    desc: "Report and restore DT outages, view the BU outage feed.",
    grants: ["Report DT Tripped", "Restore DT", "BU Outage Feed"],
  },
  {
    role: "ADMIN",
    title: "ROLE_ADMIN",
    tier: "Elevated · BU Supervisor & Clearance Authority",
    desc: "Everything User has, plus approving User-tier UARs for the BU.",
    grants: ["Approve BU UAR", "Manage Feeders", "Override Outage Logs"],
    warning: "Requires lead BU Admin or SuperAdmin sign-off.",
  },
  {
    role: "SUPERADMIN",
    title: "ROLE_SUPERADMIN",
    tier: "Restricted · Enterprise Org-Wide Authority",
    desc: "Full system authority, including DT Master and role promotion.",
    grants: ["DT Master CRUD", "Lookup Categories", "Promote BU Admins"],
    warning: "Requires an existing SuperAdmin to provision.",
  },
];

const BUSINESS_UNITS = [
  "Ikeja Business Unit (IK-BU)",
  "Oshodi Business Unit (OS-BU)",
  "Shomolu Business Unit (SH-BU)",
  "Ikorodu Business Unit (IKD-BU)",
  "Abule-Egba Business Unit (AE-BU)",
];

export default function SubmitUarPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [businessUnit, setBusinessUnit] = useState("");
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = role && businessUnit && justification.trim().length >= 20;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    // TODO: api.post("/access-requests", payload) — lands in access_requests
    // as PENDING; an Admin/SuperAdmin picks it up from /access-control.
    await new Promise((r) => setTimeout(r, 500));

    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AppShell title="Submit UAR" subtitle="Request received" hideNav>
        <div className="flex flex-col items-center justify-center gap-space-md px-margin py-space-xl text-center">
          <Icon name="task_alt" size={44} filled className="text-primary" />
          <h2 className="text-headline-md text-on-surface">UAR Submitted</h2>
          <p className="text-body-sm text-on-surface-variant max-w-xs">
            Your request is pending review by an Admin or SuperAdmin for {businessUnit}.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="min-h-[48px] px-space-lg bg-primary text-on-primary rounded-xl text-body-lg font-bold shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Submit Access Request" subtitle="Entra ID claims verified via OIDC SSO" hideNav>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full px-margin py-space-md gap-space-lg pb-space-xl"
      >
        {/* Role selection */}
        <div className="flex flex-col gap-space-sm">
          <label className="text-label-md uppercase tracking-wider text-on-surface-variant">
            1. Select Target Scope / Role
          </label>
          {ROLE_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.role}
              onClick={() => setRole(opt.role)}
              className={`text-left bg-surface-container-lowest rounded-xl p-space-md shadow-sm border-2 transition-colors ${
                role === opt.role ? "border-primary" : "border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-label-lg font-bold text-on-surface">{opt.title}</span>
                {role === opt.role && <Icon name="check" size={18} className="text-primary" />}
              </div>
              <span className="text-label-sm text-on-surface-variant block mt-0.5">{opt.tier}</span>
              <p className="text-body-sm text-on-surface-variant mt-1.5">{opt.desc}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {opt.grants.map((g) => (
                  <span
                    key={g}
                    className="text-label-sm bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded"
                  >
                    {g}
                  </span>
                ))}
              </div>
              {opt.warning && (
                <div className="flex items-center gap-1.5 mt-2 text-label-sm text-tertiary">
                  <Icon name="warning" size={14} />
                  {opt.warning}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Business unit */}
        <div className="flex flex-col gap-space-xs">
          <label className="text-label-md uppercase tracking-wider text-on-surface-variant">
            2. Primary Business Unit (BU)
          </label>
          <select
            className="w-full h-12 bg-surface-container-lowest rounded-lg px-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant focus:outline-none focus:border-2 focus:border-primary"
            value={businessUnit}
            onChange={(e) => setBusinessUnit(e.target.value)}
          >
            <option value="">Select a business unit…</option>
            {BUSINESS_UNITS.map((bu) => (
              <option key={bu} value={bu}>
                {bu}
              </option>
            ))}
          </select>
        </div>

        {/* Reference profile */}
        <div className="flex flex-col gap-space-xs">
          <label className="text-label-md uppercase tracking-wider text-on-surface-variant">
            3. Reference Peer Profile (optional)
          </label>
          <div className="flex items-center bg-surface-container-lowest rounded-xl p-space-sm shadow-sm">
            <Icon name="person_search" size={20} className="text-outline mx-space-xs" />
            <input
              className="w-full bg-transparent px-space-sm text-on-surface text-body-lg leading-tight focus:outline-none"
              placeholder="Search a colleague to clone role + BU scope from…"
            />
          </div>
        </div>

        {/* Justification */}
        <div className="flex flex-col gap-space-xs">
          <label className="text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-space-xs">
            <span>4. Operational Justification</span>
            <span className="text-secondary font-bold">*</span>
          </label>
          <textarea
            className="w-full min-h-[96px] bg-surface-container-lowest rounded-lg p-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant focus:outline-none focus:border-2 focus:border-primary resize-none"
            placeholder="Why do you need this access? (min. 20 characters)"
            maxLength={500}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
          />
          <span className="text-label-sm text-on-surface-variant self-end">
            {justification.length} / 500
          </span>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full min-h-[52px] bg-primary text-on-primary rounded-xl text-body-lg font-bold shadow-sm disabled:opacity-40 flex items-center justify-center gap-2 mt-space-md"
        >
          {submitting ? (
            <>
              <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Icon name="fingerprint" size={20} />
              Submit UAR for Approval
            </>
          )}
        </button>
      </form>
    </AppShell>
  );
}
