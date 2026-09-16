"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { AccessRequestStatusChip } from "@/components/status-chip";
import { mockAccessRequests } from "@/lib/mock-data";

export default function ApproveUarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const request = mockAccessRequests.find((r) => r.requestId === id) ?? mockAccessRequests[0];

  const [decision, setDecision] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [busy, setBusy] = useState(false);

  async function decide(next: "APPROVED" | "REJECTED") {
    setBusy(true);
    // TODO: api.patch(`/access-requests/${request.requestId}`, { status: next })
    // — writes an access_audit_log row server-side; only Admins/SuperAdmins
    // pass @PreAuthorize here, and an ADMIN approving a SUPERADMIN request
    // should be rejected by the backend regardless of what the UI shows.
    await new Promise((r) => setTimeout(r, 500));
    setBusy(false);
    setDecision(next);
  }

  return (
    <AppShell title="Role Management Detail" subtitle={`UAR-${request.requestId}`} hideNav>
      <div className="flex flex-col w-full px-margin py-space-md gap-space-lg pb-space-xl">
        <button
          onClick={() => router.push("/access-control")}
          className="flex items-center gap-1.5 text-label-sm text-on-surface-variant self-start"
        >
          <Icon name="arrow_back" size={16} />
          Back to queue
        </button>

        <div className="flex items-center justify-between">
          <AccessRequestStatusChip status={decision === "PENDING" ? request.status : decision} />
          <span className="text-label-sm text-on-surface-variant">
            Received {new Date(request.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Requester identity */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" size={20} className="text-on-primary" />
            </div>
            <div>
              <h2 className="text-headline-md text-on-surface leading-none">
                {request.requestedByName}
              </h2>
              <span className="text-label-sm text-on-surface-variant">
                Verified via Entra ID SSO
              </span>
            </div>
          </div>
        </div>

        {/* Requested role / BU */}
        <div className="grid grid-cols-2 gap-space-sm">
          <div className="bg-surface-container-low rounded-lg p-space-sm">
            <span className="text-label-sm uppercase text-on-surface-variant block mb-1">
              Requested Role
            </span>
            <span className="text-label-md font-bold text-primary">{request.requestedRole}</span>
          </div>
          <div className="bg-surface-container-low rounded-lg p-space-sm">
            <span className="text-label-sm uppercase text-on-surface-variant block mb-1">
              Target BU
            </span>
            <span className="text-label-md font-bold text-on-surface">{request.businessUnit}</span>
          </div>
        </div>

        {/* Justification */}
        {request.justification && (
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex gap-space-sm">
            <Icon name="format_quote" size={20} className="text-tertiary shrink-0" />
            <p className="text-body-sm text-on-surface-variant leading-snug">
              {request.justification}
            </p>
          </div>
        )}

        {/* Reference profile / clone template */}
        {request.referenceUserName && (
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <Icon name="tune" size={18} className="text-primary" />
              <span className="text-label-md text-on-surface uppercase tracking-wider font-bold">
                Active Source Template
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-md text-on-surface font-semibold">
                {request.referenceUserName}
              </span>
              <Icon name="check_circle" size={18} className="text-success" />
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Provisioning will clone this profile&apos;s role, BU scope, and permission grants.
            </p>
          </div>
        )}

        {/* Authority confirmation */}
        <div className="flex items-start gap-space-sm bg-surface-container-low p-space-md rounded-xl">
          <Icon name="verified" size={18} className="text-primary shrink-0 mt-0.5" />
          <p className="text-body-sm text-on-surface-variant leading-snug">
            You hold the authority to provision <span className="font-bold text-on-surface">{request.requestedRole}</span>{" "}
            tier access within <span className="font-bold text-on-surface">{request.businessUnit}</span>.
          </p>
        </div>

        {decision === "PENDING" ? (
          <div className="flex flex-col gap-space-sm mt-space-md">
            <button
              onClick={() => decide("APPROVED")}
              disabled={busy}
              className="w-full min-h-[52px] bg-primary text-on-primary rounded-xl text-body-lg font-bold shadow-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Icon name="how_to_reg" size={20} />
              Approve &amp; Provision Account
            </button>
            <button
              onClick={() => decide("REJECTED")}
              disabled={busy}
              className="w-full min-h-[48px] border-2 border-secondary text-secondary rounded-xl text-body-lg font-bold flex items-center justify-center gap-2"
            >
              <Icon name="cancel" size={20} />
              Reject Request
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-space-sm py-space-lg text-center">
            <Icon
              name={decision === "APPROVED" ? "task_alt" : "block"}
              size={40}
              filled
              className={decision === "APPROVED" ? "text-success" : "text-secondary"}
            />
            <span className="text-headline-md text-on-surface">
              {decision === "APPROVED" ? "Account Provisioned" : "Request Rejected"}
            </span>
            <Link href="/access-control" className="text-label-sm text-primary font-bold mt-2">
              Return to queue
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
