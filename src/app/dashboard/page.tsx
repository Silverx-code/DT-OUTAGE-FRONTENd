import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { Icon } from "@/components/icon";
import { mockCurrentUser, mockDashboardSummary } from "@/lib/mock-data";

const AGEING_COLORS = [
  "bg-primary-container",
  "bg-tertiary-fixed-dim",
  "bg-tertiary-container",
  "bg-secondary-container",
  "bg-secondary",
];

export default function DashboardPage() {
  const user = mockCurrentUser;
  const summary = mockDashboardSummary;
  const totalAgeing = summary.ageingBuckets.reduce((sum, b) => sum + b.count, 0);

  return (
    <AppShell
      title="Dashboard"
      subtitle={`${user.fullName} — ${user.role === "USER" ? "Field Staff" : user.role}, ${user.businessUnit}`}
    >
      <div className="flex flex-col w-full pb-8">
        {/* BU selector + SCADA sync indicator */}
        <div className="px-gutter pt-space-sm pb-space-xs flex items-center justify-between">
          <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1.5 rounded-full shadow-sm">
            <Icon name="location_city" size={18} className="text-primary" />
            <div className="flex items-center gap-1">
              <span className="text-label-md text-on-surface">{user.businessUnit}</span>
              <span className="text-outline text-label-sm">•</span>
              <span className="text-body-sm text-on-surface-variant font-medium">
                Alausa Undertaking
              </span>
            </div>
            <Icon name="expand_more" size={16} className="text-on-surface-variant ml-0.5" />
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span className="text-label-sm text-primary uppercase">Scada 2m ago</span>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="px-gutter mt-space-sm">
          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="Out Now" value={summary.outNow} sublabel="Critical Transformers" tone="critical" />
            <MetricCard
              label="Restored"
              value={summary.restoredToday}
              sublabel={`+${summary.restoredTodayDeltaPct}% vs Ystd`}
              icon={<Icon name="verified" size={18} className="text-surface-tint" />}
            />
            <MetricCard
              label="Oldest"
              value={
                <>
                  {summary.oldestOutageAgeDays}
                  <span className="text-label-md">d</span>
                </>
              }
              sublabel={summary.oldestOutageDtCode}
              icon={<Icon name="timer_off" size={18} className="text-secondary" />}
            />
          </div>
        </div>

        {/* Ageing stack */}
        <div className="px-gutter mt-space-md">
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Icon name="hourglass_top" size={18} className="text-tertiary" />
                <h2 className="text-label-lg text-on-surface font-bold uppercase tracking-wider">
                  Outage Ageing Stack
                </h2>
              </div>
              <span className="text-label-sm text-on-surface-variant">{totalAgeing} Total DTs</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-surface-container-high gap-0.5 p-0.5">
              {summary.ageingBuckets.map((bucket, i) => (
                <div
                  key={bucket.label}
                  className={`${AGEING_COLORS[i % AGEING_COLORS.length]} h-full first:rounded-l-full last:rounded-r-full`}
                  style={{ width: `${(bucket.count / totalAgeing) * 100}%` }}
                  title={`${bucket.label}: ${bucket.count}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
              {summary.ageingBuckets.map((bucket) => (
                <span key={bucket.label} className="text-label-sm text-on-surface-variant">
                  {bucket.label} · {bucket.count}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Active outages */}
        <div className="px-gutter mt-space-md flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-label-lg text-on-surface font-bold uppercase tracking-wider">
              Active Outages
            </h2>
            <Link href="/outages" className="text-label-sm text-primary font-bold">
              View all
            </Link>
          </div>
          {summary.activeOutages.map((outage) => (
            <div key={outage.outageId} className="bg-surface-container-lowest p-3 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-label-sm text-on-surface-variant">{outage.outageRef}</span>
                  <h3 className="text-body-lg text-on-surface font-semibold mt-1">
                    {outage.dtCodeSnapshot}
                  </h3>
                </div>
                <Icon name="chevron_right" className="text-outline" />
              </div>
              <div className="mt-3 pl-1 flex flex-col gap-2">
                <div className="flex items-center gap-4 text-on-surface-variant text-body-sm">
                  <span className="flex items-center gap-1">
                    <Icon name="alt_route" size={16} className="text-outline" />
                    {outage.feederSnapshot}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="speed" size={16} className="text-outline" />
                    {outage.capacitySnapshot} kVA
                  </span>
                </div>
                <div className="bg-error-container text-on-error-container p-2.5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="electrical_services" size={18} className="text-error" />
                    <span className="text-body-sm text-on-error-container font-medium">
                      Fault: {outage.faultCategory}
                    </span>
                  </div>
                  <span className="text-label-sm text-error font-bold uppercase">
                    {outage.ageingBucket}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="px-gutter mt-space-md grid grid-cols-2 gap-2.5">
          <a
            className="bg-surface-container-lowest p-3 rounded-xl shadow-sm flex flex-col justify-between active:bg-surface-container transition-colors"
            href="#"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center">
                <Icon name="bar_chart" size={16} />
              </div>
              <Icon name="north_east" size={16} className="text-outline" />
            </div>
            <div className="mt-2">
              <span className="text-body-md text-on-surface font-semibold block leading-tight">
                Power BI Portal
              </span>
              <span className="text-label-sm text-on-surface-variant mt-0.5 block">
                Executive Analytics
              </span>
            </div>
          </a>
          <Link
            href="/access-control"
            className="bg-surface-container-lowest p-3 rounded-xl shadow-sm flex flex-col justify-between active:bg-surface-container transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center">
                <Icon name="verified_user" size={16} />
              </div>
              <Icon name="north_east" size={16} className="text-outline" />
            </div>
            <div className="mt-2">
              <span className="text-body-md text-on-surface font-semibold block leading-tight">
                Access Control
              </span>
              <span className="text-label-sm text-on-surface-variant mt-0.5 block">
                Roles &amp; UAR Requests
              </span>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
