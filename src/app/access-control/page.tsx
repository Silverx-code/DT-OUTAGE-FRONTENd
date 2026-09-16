import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { AccessRequestStatusChip } from "@/components/status-chip";
import { mockAccessRequests } from "@/lib/mock-data";

const ROLE_HIERARCHY = [
  {
    role: "SUPERADMIN",
    label: "SuperAdmin (System Root)",
    detail: "Inherits everything below + BU-scoped delegation, DT Master CRUD, promotes Admins",
    count: "2 accounts",
    icon: "military_tech",
  },
  {
    role: "ADMIN",
    label: "Admin (BU Operations Lead)",
    detail: "Inherits User permissions + approves User-tier UARs, edits BU outage records",
    count: "6 leads",
    icon: "shield_person",
  },
  {
    role: "USER",
    label: "User (Field Staff & Crew)",
    detail: "Report / restore outages, edit own reports while still OUT",
    count: "48 field",
    icon: "engineering",
  },
] as const;

export default function AccessControlPage() {
  const pending = mockAccessRequests.filter((r) => r.status === "PENDING");

  return (
    <AppShell title="Access Control" subtitle="Tunde A. — SecOps & Field Lead, Ikeja BU" hideNav>
      <div className="flex flex-col w-full px-margin py-space-md gap-space-lg pb-space-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-space-xs rounded-full shadow-sm">
            <Icon name="verified_user" size={16} className="text-primary" />
            <span className="text-label-sm text-primary uppercase tracking-wider">
              Security Tier: SuperAdmin View
            </span>
          </div>
          <span className="text-label-sm text-on-surface-variant font-bold">
            SUPERADMIN &gt; ADMIN &gt; USER
          </span>
        </div>

        {/* Pending UARs */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Icon name="pending_actions" size={18} className="text-tertiary" />
              <h2 className="text-label-lg text-on-surface font-bold uppercase tracking-wider">
                Pending UARs
              </h2>
            </div>
            <span className="text-label-sm text-on-surface-variant">{pending.length} New</span>
          </div>

          {pending.map((req) => (
            <div key={req.requestId} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-label-sm text-on-surface-variant">
                    {new Date(req.createdAt).toLocaleString()}
                  </span>
                  <h3 className="text-body-lg text-on-surface font-semibold">
                    {req.requestedByName}
                  </h3>
                </div>
                <span className="text-label-sm font-bold uppercase tracking-wide text-primary bg-primary-fixed px-2 py-0.5 rounded">
                  {req.requestedRole} Tier
                </span>
              </div>
              <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                <span>{req.businessUnit}</span>
                <AccessRequestStatusChip status={req.status} />
              </div>
              {req.referenceUserName && (
                <div className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
                  <Icon name="person_search" size={14} />
                  Endorsement match: <span className="font-bold text-on-surface">{req.referenceUserName}</span>
                </div>
              )}
              <Link
                href={`/access-control/requests/${req.requestId}`}
                className="mt-1 flex items-center justify-center gap-1.5 h-11 rounded-lg bg-primary text-on-primary text-label-md font-bold"
              >
                <Icon name="how_to_reg" size={18} />
                Profile &amp; Approve
              </Link>
            </div>
          ))}

          {pending.length === 0 && (
            <div className="text-center text-body-sm text-on-surface-variant py-space-lg">
              No pending requests.
            </div>
          )}
        </div>

        {/* Role hierarchy / directory */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center gap-1.5">
            <Icon name="account_tree" size={18} className="text-primary" />
            <h2 className="text-label-lg text-on-surface font-bold uppercase tracking-wider">
              Hierarchical RLS Model
            </h2>
          </div>
          <span className="text-label-sm text-on-surface-variant -mt-2">
            Spring Security — @PreAuthorize • RoleHierarchyImpl
          </span>
          <div className="flex flex-col gap-space-xs">
            {ROLE_HIERARCHY.map((tier) => (
              <div key={tier.role} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center shrink-0">
                  <Icon name={tier.icon} size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-space-xs">
                    <span className="text-body-md text-on-surface font-semibold">{tier.label}</span>
                    <span className="text-label-sm text-on-surface-variant">{tier.count}</span>
                  </div>
                  <span className="text-body-sm text-on-surface-variant leading-snug">
                    {tier.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/access-requests/new"
          className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-primary text-primary text-body-lg font-bold"
        >
          <Icon name="fingerprint" size={20} />
          Submit a New UAR
        </Link>

        <Link href="/dashboard" className="text-center text-label-sm text-on-surface-variant">
          &larr; Back to Dashboard
        </Link>
      </div>
    </AppShell>
  );
}
