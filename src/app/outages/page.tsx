"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { AgeingChip, OutageStatusChip } from "@/components/status-chip";
import { api } from "@/lib/api";
import type { DtOutage, OutageStatus, UserSummary } from "@/lib/types";

type SortKey = "date" | "age" | "transformer" | "status";

const exportColumns: { label: string; value: (outage: DtOutage) => string | number }[] = [
  { label: "Outage reference", value: (o) => o.outageRef },
  { label: "Status", value: (o) => o.status === "OUT" ? "Active" : "Restored" },
  { label: "DT code", value: (o) => o.dtCodeSnapshot },
  { label: "Business unit", value: (o) => o.businessUnitSnapshot },
  { label: "Undertaking", value: (o) => o.undertakingSnapshot },
  { label: "Feeder", value: (o) => o.feederSnapshot },
  { label: "Capacity (kVA)", value: (o) => o.capacitySnapshot },
  { label: "Supply band", value: (o) => o.bandSnapshot },
  { label: "Outage date and time", value: (o) => o.outageDatetime },
  { label: "Fault category", value: (o) => o.faultCategory },
  { label: "Fault description", value: (o) => o.faultDescription },
  { label: "Restoration challenge", value: (o) => o.restorationChallenge ?? "" },
  { label: "Additional comment", value: (o) => o.additionalComment ?? "" },
  { label: "Restored date and time", value: (o) => o.restorationDatetime ?? "" },
  { label: "Restoration remarks", value: (o) => o.restorationRemarks ?? "" },
  { label: "Duration (minutes)", value: (o) => o.outageDurationMinutes ?? "" },
  { label: "Age (days)", value: (o) => o.ageDays },
  { label: "Ageing bucket", value: (o) => o.ageingBucket },
  { label: "Reported by", value: (o) => o.reportedByName },
  { label: "Restored by", value: (o) => o.restoredByName ?? "" },
];

function exportExcel(outages: DtOutage[]) {
  const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
  const cell = (value: string | number) => {
    const numeric = typeof value === "number";
    return `<Cell><Data ss:Type="${numeric ? "Number" : "String"}">${escapeXml(String(value))}</Data></Cell>`;
  };
  const rows = [
    `<Row>${exportColumns.map(({ label }) => cell(label)).join("")}</Row>`,
    ...outages.map((outage) => `<Row>${exportColumns.map(({ value }) => cell(value(outage))).join("")}</Row>`),
  ].join("");
  const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Outage reports"><Table>${rows}</Table></Worksheet></Workbook>`;
  const blob = new Blob(["\ufeff", workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `outage-reports-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

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
      <div className="flex items-center justify-between gap-3"><p className="text-label-sm text-on-surface-variant">Showing {filtered.length} of {outages.length} submitted faults</p><button type="button" onClick={() => exportExcel(filtered)} disabled={!filtered.length} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-label-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"><Icon name="download" size={18} />Export Excel</button></div>
      {filtered.map((o) => <div key={o.outageId} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm"><div className="flex items-center justify-between"><div><span className="text-label-sm text-on-surface-variant">{o.outageRef}</span><h3 className="text-body-lg text-on-surface font-semibold">{o.dtCodeSnapshot}</h3></div><div className="flex items-center gap-space-xs"><OutageStatusChip status={o.status} />{o.status === "OUT" && <AgeingChip ageDays={o.ageDays} />}</div></div><p className="text-body-sm text-on-surface-variant mt-1">{o.faultCategory} — {o.feederSnapshot}</p><p className="text-body-sm mt-2">{o.faultDescription}</p><div className="flex justify-between mt-2 text-label-sm text-on-surface-variant"><span>{o.businessUnitSnapshot}</span><span>{new Date(o.outageDatetime).toLocaleString()}</span></div></div>)}
      {!filtered.length && <div className="text-center text-body-sm text-on-surface-variant py-space-xl">{error || "No submitted faults match these filters."}</div>}
    </div>
  </AppShell>;
}
