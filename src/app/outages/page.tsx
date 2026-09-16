"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { AgeingChip, OutageStatusChip } from "@/components/status-chip";
import { mockActiveOutages, mockCurrentUser } from "@/lib/mock-data";
import type { DtOutage, OutageStatus } from "@/lib/types";

// Restored record for demo purposes — real data comes from
// GET /api/outages?status=RESTORED once the backend is wired up.
const mockRestored: DtOutage = {
  outageId: "o-restored-1",
  outageRef: "OUT-2026-00041",
  dtId: "dt-3",
  dtCodeSnapshot: "DT-0177-LG",
  businessUnitSnapshot: "Ikeja BU",
  undertakingSnapshot: "Alausa",
  feederSnapshot: "Opebi F2",
  capacitySnapshot: 300,
  bandSnapshot: "B",
  outageDatetime: "2026-09-05T09:15:00Z",
  faultCategory: "Ruptured Fuse",
  faultDescription: "Fuse replaced, load tested, confirmed stable",
  status: "RESTORED",
  restorationDatetime: "2026-09-06T11:00:00Z",
  outageDurationMinutes: 1545,
  ageDays: 0,
  ageingBucket: "Restored",
  reportedByName: "Tunde A.",
  restoredByName: "Ngozi O.",
};

const ALL_OUTAGES = [...mockActiveOutages, mockRestored];

export default function OutagesPage() {
  const [filter, setFilter] = useState<"ALL" | OutageStatus>("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return ALL_OUTAGES.filter((o) => {
      const matchesStatus = filter === "ALL" || o.status === filter;
      const matchesQuery =
        query.trim() === "" ||
        o.dtCodeSnapshot.toLowerCase().includes(query.toLowerCase()) ||
        o.outageRef.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [filter, query]);

  return (
    <AppShell
      title="Outage Directory"
      subtitle={`${mockCurrentUser.businessUnit} — Active + History`}
    >
      <div className="flex flex-col w-full px-margin py-space-md gap-space-md pb-space-xl">
        <div className="flex items-center bg-surface-container-lowest rounded-xl p-space-sm shadow-sm">
          <Icon name="search" size={20} className="text-outline mx-space-xs" />
          <input
            className="w-full bg-transparent px-space-sm text-on-surface text-body-lg leading-tight focus:outline-none"
            placeholder="Search DT code or outage ref…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-space-xs">
          {(["ALL", "OUT", "RESTORED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-space-sm py-1.5 rounded-full text-label-sm uppercase font-bold tracking-wide transition-colors ${
                filter === s
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              {s === "ALL" ? "All" : s === "OUT" ? "Active" : "Restored"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-space-sm">
          {filtered.map((outage) => (
            <div key={outage.outageId} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-label-sm text-on-surface-variant">{outage.outageRef}</span>
                  <h3 className="text-body-lg text-on-surface font-semibold">
                    {outage.dtCodeSnapshot}
                  </h3>
                </div>
                <div className="flex items-center gap-space-xs">
                  <OutageStatusChip status={outage.status} />
                  {outage.status === "OUT" && <AgeingChip ageDays={outage.ageDays} />}
                </div>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-1">
                {outage.faultCategory} — {outage.feederSnapshot}
              </p>
              <div className="flex items-center justify-between mt-2 text-label-sm text-on-surface-variant">
                <span>Reported {new Date(outage.outageDatetime).toLocaleDateString()}</span>
                {outage.status === "RESTORED" && outage.outageDurationMinutes && (
                  <span className="font-bold text-success">
                    {Math.round(outage.outageDurationMinutes / 60)}h restored
                  </span>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-body-sm text-on-surface-variant py-space-xl">
              No outages match this filter.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
