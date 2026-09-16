"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { mockChallengeCategories, mockCurrentUser, mockFaultCategories } from "@/lib/mock-data";
import { api, ApiError } from "@/lib/api";
import type { ChallengeCategory, FaultCategory, ReportOutagePayload } from "@/lib/types";

// Stand-in for the real DT lookup call (GET /api/dt-master/search?q=).
const MOCK_DT = {
  dtId: "dt-1",
  dtCode: "DT-0234-LG",
  dtName: "Opebi Transformer 1",
  businessUnit: "Ikeja BU",
  undertaking: "Alausa",
  feeder: "Opebi F1 (11kV HT Route)",
  capacityKva: 500,
  supplyBand: "B",
};

export default function ReportOutagePage() {
  const router = useRouter();
  const [faultCategoryId, setFaultCategoryId] = useState<number | "">("");
  const [faultDescription, setFaultDescription] = useState("");
  const [challengeId, setChallengeId] = useState<number | "">("");
  const [comment, setComment] = useState("");
  const [dtId, setDtId] = useState<string | null>(null);
  const [faultCategories, setFaultCategories] = useState<FaultCategory[]>(mockFaultCategories);
  const [challengeCategories, setChallengeCategories] = useState<ChallengeCategory[]>(mockChallengeCategories);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requiredFilled = Boolean(dtId) && faultCategoryId !== "" && faultDescription.trim().length >= 10;

  useEffect(() => {
    let cancelled = false;
    async function loadReportData() {
      try {
        const [dtResults, categories, challenges] = await Promise.all([
          api.get<{ dtId: string }[]>(`/dt-master/search?q=${encodeURIComponent(MOCK_DT.dtCode)}`),
          api.get<FaultCategory[]>("/lookups/fault-categories"),
          api.get<ChallengeCategory[]>("/lookups/challenge-categories"),
        ]);
        if (cancelled) return;
        setDtId(dtResults[0]?.dtId ?? null);
        setFaultCategories(categories);
        setChallengeCategories(challenges);
        if (!dtResults[0]) setError("The selected transformer could not be found.");
      } catch {
        if (!cancelled) setError("Could not load report data. Please check your connection and try again.");
      }
    }
    void loadReportData();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requiredFilled) return;
    setSubmitting(true);
    setError(null);
    const now = new Date();
    const payload: ReportOutagePayload = {
      dtId: dtId!,
      outageDate: now.toISOString().slice(0, 10),
      outageTime: now.toTimeString().slice(0, 8),
      faultCategoryId: faultCategoryId as number,
      faultDescription: faultDescription.trim(),
      ...(challengeId === "" ? {} : { challengeId }),
      ...(comment.trim() ? { additionalComment: comment.trim() } : {}),
    };

    // TODO: replace with api.post<DtOutage>("/outages", payload)
    // — the backend enforces the one-active-outage-per-DT constraint and
    // returns 409 with the existing outage_ref on a clash, which the UI
    // should surface right here instead of a generic error.
    try {
      const response = await api.post<{ outageRef: string }>("/outages", payload);
      setSubmitted(response.outageRef);
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status === 409
        ? "This transformer already has an active outage report."
        : "The report could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      title="Report Outage"
      subtitle={`${mockCurrentUser.fullName} — Field Staff, ${mockCurrentUser.businessUnit}`}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full px-margin py-space-md gap-space-lg pb-space-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-space-xs rounded-full shadow-sm">
            <Icon name="bolt" size={16} filled className="text-primary" />
            <span className="text-label-sm text-primary uppercase tracking-wider">
              Active Mode
            </span>
          </div>
        </div>

        {/* DT lookup */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <label className="text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-space-xs">
              <span>Distribution Transformer (DT) Lookup</span>
              <span className="text-secondary font-bold">*</span>
            </label>
          </div>
          <div className="flex items-center bg-surface-container-lowest rounded-xl p-space-sm shadow-md transition-all focus-within:shadow-xl">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
              <Icon name="electric_meter" size={22} className="text-on-primary-fixed" />
            </div>
            <input
              className="w-full bg-transparent px-space-sm text-on-surface text-headline-md leading-tight focus:outline-none placeholder:text-outline"
              placeholder="Search DT by code, street or feeder..."
              defaultValue={`${MOCK_DT.dtCode} — ${MOCK_DT.dtName}`}
            />
            <button
              type="button"
              aria-label="Clear or re-scan QR tag"
              className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shrink-0"
            >
              <Icon name="qr_code_scanner" size={20} />
            </button>
          </div>
        </div>

        {/* Duplicate prevention banner */}
        <div className="flex items-start gap-space-sm bg-surface-container-low p-space-md rounded-xl shadow-sm">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Icon name="verified" size={18} className="text-on-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="text-label-md text-primary tracking-wide">
                Verified active asset
              </span>
              <span className="text-label-sm bg-primary-fixed text-on-primary-fixed px-1.5 py-0.5 rounded font-bold uppercase">
                Zero Clashes
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-0.5 leading-snug">
              No open outage tickets registered on{" "}
              <span className="text-label-sm font-bold text-on-surface">{MOCK_DT.dtCode}</span>.
              Enforced by the unique active-outage constraint.
            </p>
          </div>
        </div>

        {/* Locked DT master snapshot */}
        <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-md gap-space-sm">
          <div className="flex items-center gap-space-xs pb-space-xs">
            <Icon name="lock_reset" size={20} className="text-tertiary" />
            <span className="text-label-md text-on-surface uppercase tracking-wider font-bold">
              DT Master Snapshot (Immutable)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-space-sm">
            <SnapshotField label="Business Unit" value={MOCK_DT.businessUnit} />
            <SnapshotField label="Undertaking" value={MOCK_DT.undertaking} />
            <SnapshotField label="Primary Feeder Circuit" value={MOCK_DT.feeder} span2 highlight />
            <SnapshotField label="Capacity" value={`${MOCK_DT.capacityKva} kVA`} />
            <SnapshotField label="Supply Band" value={MOCK_DT.supplyBand} />
          </div>
        </div>

        {/* Fault category */}
        <Field label="Fault Category" required>
          <select
            className="w-full h-12 bg-surface-container-lowest rounded-lg px-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant focus:outline-none focus:border-2 focus:border-primary"
            value={faultCategoryId}
            onChange={(e) => setFaultCategoryId(Number(e.target.value) || "")}
          >
            <option value="">Select a fault category…</option>
            {faultCategories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>
        </Field>

        {/* Fault description */}
        <Field label="Fault Description" required>
          <textarea
            id="faultDescription"
            className="w-full min-h-[96px] bg-surface-container-lowest rounded-lg p-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant focus:outline-none focus:border-2 focus:border-primary resize-none"
            placeholder="Describe what happened, in as much detail as you can…"
            maxLength={250}
            value={faultDescription}
            onChange={(e) => setFaultDescription(e.target.value)}
          />
          <span className="text-label-sm text-on-surface-variant self-end">
            {faultDescription.length} / 250
          </span>
        </Field>

        {/* Restoration challenge — optional at report time */}
        <Field label="Restoration Challenge (if known)">
          <select
            className="w-full h-12 bg-surface-container-lowest rounded-lg px-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant focus:outline-none focus:border-2 focus:border-primary"
            value={challengeId}
            onChange={(e) => setChallengeId(Number(e.target.value) || "")}
          >
            <option value="">Not yet known — can be added at restoration</option>
            {challengeCategories.map((c) => (
              <option key={c.challengeId} value={c.challengeId}>
                {c.challengeName}
              </option>
            ))}
          </select>
        </Field>

        {/* Additional comment */}
        <Field label="Additional Comment (optional)">
          <textarea
            className="w-full min-h-[72px] bg-surface-container-lowest rounded-lg p-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant focus:outline-none focus:border-2 focus:border-primary resize-none"
            placeholder="Anything else worth flagging…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Field>

        <div className="flex flex-col gap-space-sm mt-space-md">
          <button
            type="submit"
            disabled={!requiredFilled || submitting}
            className="w-full min-h-[52px] bg-primary text-on-primary rounded-xl text-body-lg font-bold shadow-sm disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit Report"
            )}
          </button>
          <span className="text-label-sm text-on-surface-variant text-center">
            Reports are saved securely when submitted
          </span>
        </div>
        {error && <p className="text-body-sm text-error text-center" role="alert">{error}</p>}
      </form>

      {submitted && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-gutter bg-inverse-surface/40 backdrop-blur-sm">
          <div className="flex flex-col w-full max-w-sm bg-surface-container-lowest rounded-2xl p-space-lg shadow-xl gap-space-md">
            <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mx-auto">
              <Icon name="check_circle" size={36} filled className="text-primary" />
            </div>
            <div className="flex flex-col text-center gap-1">
              <span className="text-headline-md text-on-surface">Outage Ticket Created</span>
              <span className="text-label-lg text-primary font-bold">{submitted}</span>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Dispatched to {MOCK_DT.businessUnit} Fault Clearing Unit.
              </p>
            </div>
            <div className="flex flex-col bg-surface-container-low p-space-sm rounded-xl gap-1 text-left">
              <div className="flex justify-between text-label-sm text-on-surface-variant">
                <span>Asset ID</span>
                <span className="font-bold text-on-surface">{MOCK_DT.dtCode}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full min-h-[48px] bg-primary text-on-primary rounded-xl text-body-lg font-bold shadow-sm"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
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

function SnapshotField({
  label,
  value,
  span2,
  highlight,
}: {
  label: string;
  value: string;
  span2?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`flex flex-col p-space-sm bg-surface-container-low rounded-lg ${span2 ? "col-span-2" : ""}`}>
      <div className="flex items-center justify-between text-on-surface-variant mb-1">
        <span className="text-label-sm uppercase">{label}</span>
        <Icon name="lock" size={14} />
      </div>
      <span className={`text-label-md font-bold ${highlight ? "text-primary" : "text-on-surface"}`}>
        {value}
      </span>
    </div>
  );
}
