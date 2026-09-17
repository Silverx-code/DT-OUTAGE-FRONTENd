"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { api } from "@/lib/api";
import type { ChallengeCategory, DtMaster, FaultCategory } from "@/lib/types";

type LookupForm = { name: string; sortOrder: string };
type DtForm = { dtCode: string; dtName: string; businessUnit: string; undertaking: string; feeder: string; capacityKva: string; supplyBand: string };
const emptyDt: DtForm = { dtCode: "", dtName: "", businessUnit: "", undertaking: "", feeder: "", capacityKva: "", supplyBand: "" };

export default function DataManagementPage() {
  const [transformers, setTransformers] = useState<DtMaster[]>([]);
  const [faults, setFaults] = useState<FaultCategory[]>([]);
  const [challenges, setChallenges] = useState<ChallengeCategory[]>([]);
  const [dt, setDt] = useState(emptyDt);
  const [fault, setFault] = useState<LookupForm>({ name: "", sortOrder: "0" });
  const [challenge, setChallenge] = useState<LookupForm>({ name: "", sortOrder: "0" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [dts, fs, cs] = await Promise.all([api.get<DtMaster[]>("/dt-master/admin/all"), api.get<FaultCategory[]>("/lookups/admin/fault-categories"), api.get<ChallengeCategory[]>("/lookups/admin/challenge-categories")]);
      setTransformers(dts); setFaults(fs); setChallenges(cs);
    } catch { setError("Data could not be loaded. Confirm that your account is an active Admin."); }
  }
  useEffect(() => { void load(); }, []);

  async function submit(event: FormEvent, path: string, body: unknown, reset: () => void) {
    event.preventDefault(); setError(""); setMessage("");
    try { await api.post(path, body); reset(); setMessage("Saved successfully."); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save data."); }
  }

  return <AppShell title="Data Management" subtitle="Populate transformer and reporting reference data" hideNav>
    <div data-tutorial="data-management" className="flex w-full flex-col gap-space-lg px-margin py-space-md pb-space-xl">
      <div className="rounded-xl bg-primary-fixed p-space-md text-on-primary-fixed-variant"><div className="flex items-center gap-2 font-bold"><Icon name="database" size={20} /> Admin data management</div><p className="mt-2 text-body-sm">Admins can add and maintain the records used by outage reporting. Existing outage records keep their own immutable transformer snapshot.</p><Link href="/access-control" className="mt-3 inline-block text-label-md font-bold underline">Back to access control</Link></div>
      <form onSubmit={(e) => submit(e, "/dt-master", { ...dt, capacityKva: Number(dt.capacityKva), active: true }, () => setDt(emptyDt))} className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm"><h2 className="text-label-lg font-bold uppercase tracking-wider">Add distribution transformer</h2><div className="grid gap-space-sm md:grid-cols-2">{([['dtCode','DT code'],['dtName','Name'],['businessUnit','Business unit'],['undertaking','Undertaking'],['feeder','Feeder'],['capacityKva','Capacity (kVA)'],['supplyBand','Supply band']] as const).map(([key, label]) => <input key={key} required value={dt[key]} onChange={(e) => setDt({ ...dt, [key]: e.target.value })} placeholder={label} type={key === 'capacityKva' ? 'number' : 'text'} className="h-11 rounded-lg border border-outline-variant bg-surface px-3 text-body-sm" />)}</div><button className="h-11 rounded-lg bg-primary text-label-md font-bold text-on-primary">Add transformer</button></form>
      <div className="grid gap-space-lg md:grid-cols-2">
        <LookupForm title="Add fault category" value={fault} setValue={setFault} onSubmit={(e) => submit(e, "/lookups/fault-categories", { name: fault.name, sortOrder: Number(fault.sortOrder), active: true }, () => setFault({ name: "", sortOrder: "0" }))} />
        <LookupForm title="Add restoration challenge" value={challenge} setValue={setChallenge} onSubmit={(e) => submit(e, "/lookups/challenge-categories", { name: challenge.name, sortOrder: Number(challenge.sortOrder), active: true }, () => setChallenge({ name: "", sortOrder: "0" }))} />
      </div>
      {message && <p className="text-body-sm text-green-700">{message}</p>}{error && <p className="text-body-sm text-red-700">{error}</p>}
      <DataList title={`Transformers (${transformers.length})`} items={transformers.map((x) => `${x.dtCode} — ${x.dtName} · ${x.businessUnit} · ${x.feeder}`)} />
      <div className="grid gap-space-lg md:grid-cols-2"><DataList title={`Fault categories (${faults.length})`} items={faults.map((x) => x.categoryName)} /><DataList title={`Restoration challenges (${challenges.length})`} items={challenges.map((x) => x.challengeName)} /></div>
    </div>
  </AppShell>;
}

function LookupForm({ title, value, setValue, onSubmit }: { title: string; value: LookupForm; setValue: (value: LookupForm) => void; onSubmit: (event: FormEvent) => void }) { return <form onSubmit={onSubmit} className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm"><h2 className="text-label-lg font-bold uppercase tracking-wider">{title}</h2><input required value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} placeholder="Name" className="h-11 rounded-lg border border-outline-variant bg-surface px-3 text-body-sm" /><input required type="number" min="0" value={value.sortOrder} onChange={(e) => setValue({ ...value, sortOrder: e.target.value })} placeholder="Sort order" className="h-11 rounded-lg border border-outline-variant bg-surface px-3 text-body-sm" /><button className="h-11 rounded-lg bg-primary text-label-md font-bold text-on-primary">Add</button></form>; }
function DataList({ title, items }: { title: string; items: string[] }) { return <section><h2 className="mb-space-sm text-label-lg font-bold uppercase tracking-wider">{title}</h2><div className="flex max-h-80 flex-col overflow-y-auto gap-space-xs">{items.map((item, index) => <div key={`${item}-${index}`} className="rounded-lg bg-surface-container-lowest px-space-md py-space-sm text-body-sm shadow-sm">{item}</div>)}</div></section>; }
