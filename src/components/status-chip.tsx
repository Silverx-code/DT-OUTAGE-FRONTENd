import type { OutageStatus, AccessRequestStatus } from "@/lib/types";

type ChipTone = "critical" | "caution" | "success" | "neutral";

const TONE_CLASSES: Record<ChipTone, string> = {
  critical: "bg-error-container text-on-error-container border-secondary",
  caution:
    "bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary",
  success: "bg-success-container text-on-success-container border-success",
  neutral:
    "bg-surface-container-high text-on-surface-variant border-outline-variant",
};

export function ToneChip({
  label,
  tone,
}: {
  label: string;
  tone: ChipTone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-label-sm uppercase tracking-wider font-bold ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}

export function OutageStatusChip({ status }: { status: OutageStatus }) {
  return status === "OUT" ? (
    <ToneChip label="Out" tone="critical" />
  ) : (
    <ToneChip label="Restored" tone="success" />
  );
}

export function AgeingChip({ ageDays }: { ageDays: number }) {
  if (ageDays <= 2) return <ToneChip label={`${ageDays}d`} tone="success" />;
  if (ageDays <= 12) return <ToneChip label={`${ageDays}d`} tone="caution" />;
  return <ToneChip label={`${ageDays}d`} tone="critical" />;
}

export function AccessRequestStatusChip({
  status,
}: {
  status: AccessRequestStatus;
}) {
  const tone: ChipTone =
    status === "APPROVED"
      ? "success"
      : status === "REJECTED"
        ? "critical"
        : "caution";
  return <ToneChip label={status} tone={tone} />;
}
