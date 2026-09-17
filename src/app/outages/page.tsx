"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { AgeingChip, OutageStatusChip } from "@/components/status-chip";
import { api } from "@/lib/api";
import type { DtOutage, OutageStatus, UserSummary } from "@/lib/types";

type SortKey = "date" | "age" | "transformer" | "status";

export default function OutagesPage() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [outages, setOutages] = useState<DtOutage[]>([]);
  const [filter, setFilter] = useState<"ALL" | OutageStatus>("ALL");
  const [query, setQuery] = useState("");
  const [businessUnit, setBusinessUnit] = useState("");
  const [fault, setFault] = useState("");
  const [sort, setSort] = useState<SortKey>("date");
  const [ascending, setAscending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { api.get<UserSummary>("/me").then(setUser).catch(() => undefined); api.get<DtOutage[]>("/outages").then(setOutages).catch(() => setError("Submitted outages could not be loaded.")); }, []);
  const businessUnits = useMemo(() => [...new Set(outages.map((o) => o.businessUnitSnapshot))].sort(), [outages]);
  const faults = useMemo(() => [...new Set(outages.map((o) => o.faultCategory))].sort(), [outages]);
  const filtered = useMemo(() => outages.filter((o) => (filter === "ALL" || o.status === filter) && (!query || `${o.dtCodeSnapshot} ${o.outageRef} ${o.faultDescription} ${o.feederSnapshot}`.toLowerCase().includes(query.toLowerCase())) && (!businessUnit || o.businessUnitSnapshot === businessUnit) && (!fault || o.faultCategory === fault)).sort((a, b) => { let result = sort === "age" ? a.ageDays - b.ageDays : sort === "transformer" ? a.dtCodeSnapshot.localeCompare(b.dtCodeSnapshot) : sort === "status" ? a.status.localeCompare(b.status) : new Date(a.outageDatetime).getTime() - new Date(b.outageDatetime).getTime(); return ascending ? result : -result; }), [outages, filter, query, businessUnit, fault, sort, ascending]);
  return <AppShell title="Outage Directory" subtitle={user ? `${user.fullName} — ${user.role} · All submitted data` : "Submitted outage data"}>
    <div data-tutorial="outage-directory" className="flex flex-col w-full px-margin py-space-md gap-space-md pb-space-xl">
      <div className="flex items-center bg-surface-container-lowest rounded-xl p-space-sm shadow-sm"><Icon name="search" size={20} className="text-outline mx-space-xs" /><input className="w-full bg-transparent px-space-sm text-on-surface text-body-lg focus:outline-none" placeholder="Search DT, outage ref, feeder, or fault…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-space-sm"><select value={filter} onChange={(e) => setFilter(e.target.value as "ALL" | OutageStatus)} className="h-11 rounded-lg border border-outline-variant bg-surface px-3 text-body-sm"><option value="ALL">All statuses</option><option value="OUT">Active</option><option value="RESTORED">Restored</option></select><select value={businessUnit} onChange={(e) => setBusinessUnit(e.target.value)} className="h-11 rounded-lg border border-outline-variant bg-surface px-3 text-body-sm"><option value="">All business units</option>{businessUnits.map((x) => <option key={x}>{x}</option>)}</select><select value={fault} onChange={(e) => setFault(e.target.value)} className="h-11 rounded-lg border border-outline-variant bg-surface px-3 text-body-sm"><option value="">All fault categories</option>{faults.map((x) => <option key={x}>{x}</option>)}</select><div className="flex gap-space-xs"><select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-11 min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface px-3 text-body-sm"><option value="date">Sort by date</option><option value="age">Sort by age</option><option value="transformer">Sort by transformer</option><option value="status">Sort by status</option></select><button type="button" aria-label="Toggle sort direction" onClick={() => setAscending(!ascending)} className="w-11 rounded-lg bg-primary text-on-primary">{ascending ? "↑" : "↓"}</button></div></div>
      <p className="text-label-sm text-on-surface-variant">Showing {filtered.length} of {outages.length} submitted faults</p>
      {filtered.map((o) => <div key={o.outageId} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm"><div className="flex items-center justify-between"><div><span className="text-label-sm text-on-surface-variant">{o.outageRef}</span><h3 className="text-body-lg text-on-surface font-semibold">{o.dtCodeSnapshot}</h3></div><div className="flex items-center gap-space-xs"><OutageStatusChip status={o.status} />{o.status === "OUT" && <AgeingChip ageDays={o.ageDays} />}</div></div><p className="text-body-sm text-on-surface-variant mt-1">{o.faultCategory} — {o.feederSnapshot}</p><p className="text-body-sm mt-2">{o.faultDescription}</p><div className="flex justify-between mt-2 text-label-sm text-on-surface-variant"><span>{o.businessUnitSnapshot}</span><span>{new Date(o.outageDatetime).toLocaleString()}</span></div></div>)}
      {!filtered.length && <div className="text-center text-body-sm text-on-surface-variant py-space-xl">{error || "No submitted faults match these filters."}</div>}
    </div>
  </AppShell>;
}
