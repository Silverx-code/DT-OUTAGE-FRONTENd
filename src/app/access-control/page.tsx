"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { api } from "@/lib/api";
import type { Role, UserSummary } from "@/lib/types";

const ROLE_DETAILS: Record<Role, string> = {
  USER: "Reports and restores transformer outages.",
  ADMIN: "Manages users and supervises business-unit operations.",
  SUPERADMIN: "Full system administration and role management.",
};

export default function AccessControlPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ authId: "", fullName: "", email: "", role: "USER" as Role, businessUnit: "" });

  const loadUsers = () => api.get<UserSummary[]>("/users").then(setUsers).catch(() => setError("Users could not be loaded. Confirm that you are an active Admin or SuperAdmin."));
  useEffect(() => { void loadUsers(); }, []);

  async function createUser(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    try {
      await api.post<UserSummary>("/users", form);
      setForm({ authId: "", fullName: "", email: "", role: "USER", businessUnit: "" });
      setMessage("User added successfully."); await loadUsers();
    } catch (err) { setError(err instanceof Error ? err.message : "User could not be added."); }
  }

  return (
    <AppShell title="Access Control" subtitle="Add and manage approved Gridline users" hideNav>
      <div className="flex w-full flex-col gap-space-lg px-margin py-space-md pb-space-xl">
        <div className="rounded-xl bg-primary-fixed p-space-md text-on-primary-fixed-variant"><div className="flex items-center gap-2 font-bold"><Icon name="admin_panel_settings" size={20} /> User provisioning</div><p className="mt-2 text-body-sm">Admins can add Users. SuperAdmins can add Users, Admins, and SuperAdmins. New users must use the Entra Object ID from their Microsoft account.</p></div>
        <form onSubmit={createUser} className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
          <h2 className="text-label-lg font-bold uppercase tracking-wider">Add user</h2>
          <input required value={form.authId} onChange={(e) => setForm({ ...form, authId: e.target.value })} placeholder="Entra Object ID" className="h-11 rounded-lg border border-outline-variant bg-surface px-3 text-body-sm" />
          <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" className="h-11 rounded-lg border border-outline-variant bg-surface px-3 text-body-sm" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="h-11 rounded-lg border border-outline-variant bg-surface px-3 text-body-sm" />
          <input required value={form.businessUnit} onChange={(e) => setForm({ ...form, businessUnit: e.target.value })} placeholder="Business unit" className="h-11 rounded-lg border border-outline-variant bg-surface px-3 text-body-sm" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="h-11 rounded-lg border border-outline-variant bg-surface px-3 text-body-sm"><option value="USER">User</option><option value="ADMIN">Admin</option><option value="SUPERADMIN">SuperAdmin</option></select>
          <p className="text-label-sm text-on-surface-variant">{ROLE_DETAILS[form.role]}</p>
          <button className="h-11 rounded-lg bg-primary text-label-md font-bold text-on-primary">Add user</button>
          {message && <p className="text-body-sm text-green-700">{message}</p>}{error && <p className="text-body-sm text-red-700">{error}</p>}
        </form>
        <div className="flex flex-col gap-space-sm"><h2 className="text-label-lg font-bold uppercase tracking-wider">User directory</h2>{users.map((user) => <div key={user.userId} className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-space-md shadow-sm"><div><p className="font-semibold">{user.fullName}</p><p className="text-body-sm text-on-surface-variant">{user.email} · {user.businessUnit}</p></div><span className="rounded bg-primary-fixed px-2 py-1 text-label-sm font-bold">{user.role}</span></div>)}</div>
      </div>
    </AppShell>
  );
}
