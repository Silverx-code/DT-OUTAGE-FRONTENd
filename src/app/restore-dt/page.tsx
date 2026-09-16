"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { AgeingChip } from "@/components/status-chip";
import { mockActiveOutages, mockChallengeCategories, mockCurrentUser } from "@/lib/mock-data";

export default function RestoreDtPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(mockActiveOutages[0]?.outageId ?? "");
  const [remarks, setRemarks] = useState("");
  const [challengeId, setChallengeId] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [restored, setRestored] = useState(false);

  const selected = mockActiveOutages.find((o) => o.outageId === selectedId);
  const canSubmit = !!selected && remarks.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    // TODO: api.patch(`/outages/${selected.outageId}/restore`, payload)
    // — server validates restoration datetime >= outage datetime and
    // computes outage_duration_minutes; surface the 400 here if it fails.
    await new Promise((r) => setTimeout(r, 500));

    setSubmitting(false);
    setRestored(true);
  }

  return (
    <AppShell
      title="Restore DT"
      subtitle={`${mockCurrentUser.fullName} — Field Staff, ${mockCurrentUser.businessUnit}`}
    >
      {restored ? (
        <div className="flex flex-col items-center justify-center gap-space-md px-margin py-space-xl text-center">
          <div className="w-16 h-16 rounded-full bg-success-container flex items-center justify-center">
            <Icon name="check_circle" size={36} filled className="text-success" />
          </div>
          <div>
            <h2 className="text-headline-md text-on-surface">DT Restored</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {selected?.dtCodeSnapshot} is back online. Audit entry logged.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="min-h-[48px] px-space-lg bg-primary text-on-primary rounded-xl text-body-lg font-bold shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full px-margin py-space-md gap-space-lg pb-space-xl"
        >
          <div className="flex flex-col gap-space-xs">
            <label className="text-label-md uppercase tracking-wider text-on-surface-variant">
              Active outage search
            </label>
            <div className="flex items-center bg-surface-container-lowest rounded-xl p-space-sm shadow-md">
              <Icon name="search" size={20} className="text-outline mx-space-xs" />
              <input
                className="w-full bg-transparent px-space-sm text-on-surface text-body-lg leading-tight focus:outline-none"
                placeholder="Search by DT code or outage ref…"
              />
            </div>
          </div>

          <div className="flex flex-col gap-space-sm">
            {mockActiveOutages.map((outage) => (
              <button
                type="button"
                key={outage.outageId}
                onClick={() => setSelectedId(outage.outageId)}
                className={`text-left bg-surface-container-lowest rounded-xl p-space-md shadow-sm border-2 transition-colors ${
                  selectedId === outage.outageId ? "border-primary" : "border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-label-sm text-on-surface-variant">{outage.outageRef}</span>
                    <h3 className="text-body-lg text-on-surface font-semibold">
                      {outage.dtCodeSnapshot}
                    </h3>
                  </div>
                  <AgeingChip ageDays={outage.ageDays} />
                </div>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  {outage.faultCategory} — {outage.faultDescription}
                </p>
              </button>
            ))}
          </div>

          {selected && (
            <>
              <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-md gap-space-sm">
                <div className="flex items-center gap-space-xs pb-space-xs">
                  <Icon name="summarize" size={20} className="text-primary" />
                  <span className="text-label-md text-on-surface uppercase tracking-wider font-bold">
                    Outage Summary
                  </span>
                </div>
                <SummaryRow label="Feeder" value={selected.feederSnapshot} />
                <SummaryRow label="Fault Category" value={selected.faultCategory} />
                <SummaryRow label="Reported By" value={selected.reportedByName} />
                <SummaryRow
                  label="Reported"
                  value={new Date(selected.outageDatetime).toLocaleString()}
                />
              </div>

              <Field label="Restoration Date &amp; Time" required>
                <div className="grid grid-cols-2 gap-space-sm">
                  <input
                    type="date"
                    className="h-12 bg-surface-container-lowest rounded-lg px-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant focus:outline-none focus:border-2 focus:border-primary"
                  />
                  <input
                    type="time"
                    className="h-12 bg-surface-container-lowest rounded-lg px-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant focus:outline-none focus:border-2 focus:border-primary"
                  />
                </div>
              </Field>

              <Field label="Restoration Remarks" required>
                <textarea
                  className="w-full min-h-[80px] bg-surface-container-lowest rounded-lg p-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant focus:outline-none focus:border-2 focus:border-primary resize-none"
                  placeholder="What was done to restore the DT…"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </Field>

              <Field label="Challenge faced (if not already set)">
                <select
                  className="w-full h-12 bg-surface-container-lowest rounded-lg px-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant focus:outline-none focus:border-2 focus:border-primary"
                  value={challengeId}
                  onChange={(e) => setChallengeId(Number(e.target.value) || "")}
                >
                  <option value="">
                    {selected.restorationChallenge ?? "None recorded"}
                  </option>
                  {mockChallengeCategories.map((c) => (
                    <option key={c.challengeId} value={c.challengeId}>
                      {c.challengeName}
                    </option>
                  ))}
                </select>
              </Field>

              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="w-full min-h-[52px] bg-primary text-on-primary rounded-xl text-body-lg font-bold shadow-sm disabled:opacity-40 flex items-center justify-center gap-2 mt-space-md"
              >
                {submitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Confirming…
                  </>
                ) : (
                  "Confirm Restoration"
                )}
              </button>
            </>
          )}
        </form>
      )}
    </AppShell>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-space-xs">
      <label className="text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-space-xs">
        <span>{label}</span>
        {required && <span className="text-secondary font-bold">*</span>}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-body-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="text-on-surface font-medium">{value}</span>
    </div>
  );
}
