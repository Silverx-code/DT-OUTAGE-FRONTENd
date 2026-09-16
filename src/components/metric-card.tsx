import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  sublabel?: string;
  tone?: "critical" | "default";
  icon?: ReactNode;
}

export function MetricCard({ label, value, sublabel, tone = "default", icon }: MetricCardProps) {
  if (tone === "critical") {
    return (
      <div className="bg-secondary-container text-on-secondary-container p-3 rounded-xl flex flex-col justify-between shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-label-sm text-on-secondary-container/90 uppercase tracking-wide">
            {label}
          </span>
          <span className="w-2 h-2 rounded-full bg-on-secondary-container animate-pulse" />
        </div>
        <div className="mt-2">
          <div className="text-headline-lg font-bold tracking-tight leading-none">{value}</div>
          {sublabel && (
            <span className="text-label-sm text-on-secondary-container/80 mt-1 block">
              {sublabel}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-3 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-label-sm text-outline uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <div className="mt-2">
        <div className="text-headline-lg text-on-surface font-bold tracking-tight leading-none">
          {value}
        </div>
        {sublabel && (
          <span className="text-label-sm text-surface-tint mt-1 block font-semibold">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
