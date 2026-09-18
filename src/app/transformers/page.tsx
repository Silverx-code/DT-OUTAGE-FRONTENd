"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { api } from "@/lib/api";
import type { DtMaster } from "@/lib/types";

export default function TransformersPage() {
  const [transformers, setTransformers] = useState<DtMaster[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<DtMaster[]>("/dt-master")
      .then(setTransformers)
      .catch(() => setError("Transformer directory could not be loaded."));
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return transformers;
    return transformers.filter((dt) =>
      `${dt.dtCode} ${dt.dtName} ${dt.businessUnit} ${dt.undertaking} ${dt.feeder}`
        .toLowerCase().includes(value));
  }, [query, transformers]);

  return (
    <AppShell title="Transformers" subtitle="Browse the active transformer directory">
      <div className="flex w-full flex-col gap-space-md px-margin py-space-md">
        <div className="flex items-center rounded-xl bg-surface-container-lowest p-space-sm shadow-sm">
          <Icon name="search" size={20} className="mx-space-xs text-outline" />
          <input className="w-full bg-transparent px-space-sm text-body-lg focus:outline-none" placeholder="Search code, name, business unit, undertaking, or feeder…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search transformers" />
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-label-lg font-bold uppercase tracking-wider">Transformer directory</h2>
          <span className="text-label-sm text-on-surface-variant">{filtered.length} of {transformers.length}</span>
        </div>
        {error && <p className="rounded-lg bg-red-50 p-3 text-body-sm text-red-700">{error}</p>}
        <div className="grid gap-space-sm md:grid-cols-2">
          {filtered.map((dt) => (
            <article key={dt.dtId} className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
              <div className="flex items-start justify-between gap-space-sm">
                <div><p className="text-label-sm font-bold text-primary">{dt.dtCode}</p><h3 className="text-body-lg font-semibold">{dt.dtName}</h3></div>
                <span className="rounded bg-green-100 px-2 py-1 text-label-sm font-bold text-green-700">Active</span>
              </div>
              <p className="mt-space-sm text-body-sm text-on-surface-variant">{dt.businessUnit} · {dt.undertaking}</p>
              <p className="text-body-sm text-on-surface-variant">{dt.feeder} · {dt.capacityKva} kVA · Band {dt.supplyBand}</p>
            </article>
          ))}
        </div>
        {!error && !filtered.length && <p className="py-space-lg text-center text-body-sm text-on-surface-variant">No transformers match your search.</p>}
      </div>
    </AppShell>
  );
}
