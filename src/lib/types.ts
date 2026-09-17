export type Role = "USER" | "PAT" | "ADMIN" | "SUPERADMIN";

export type OutageStatus = "OUT" | "RESTORED";

export type AccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface UserSummary {
  userId: string;
  fullName: string;
  email: string;
  role: Role;
  businessUnit: string;
  isActive: boolean;
}

export interface DtMaster {
  dtId: string;
  dtCode: string;
  dtName: string;
  businessUnit: string;
  undertaking: string;
  feeder: string;
  capacityKva: number;
  supplyBand: string;
  isActive: boolean;
}

export interface LookupCategory {
  categoryId?: number;
  challengeId?: number;
  categoryName?: string;
  challengeName?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface FaultCategory {
  categoryId: number;
  categoryName: string;
}

export interface ChallengeCategory {
  challengeId: number;
  challengeName: string;
}

export interface DtOutage {
  outageId: string;
  outageRef: string;
  dtId: string;
  dtCodeSnapshot: string;
  businessUnitSnapshot: string;
  undertakingSnapshot: string;
  feederSnapshot: string;
  capacitySnapshot: number;
  bandSnapshot: string;
  outageDatetime: string;
  faultCategory: string;
  faultDescription: string;
  restorationChallenge?: string;
  additionalComment?: string;
  status: OutageStatus;
  restorationDatetime?: string;
  restorationRemarks?: string;
  outageDurationMinutes?: number;
  ageDays: number;
  ageingBucket: string;
  reportedByName: string;
  restoredByName?: string;
}

export interface DashboardSummary {
  outNow: number;
  restoredToday: number;
  restoredTodayDeltaPct: number;
  oldestOutageAgeDays: number;
  oldestOutageDtCode: string;
  ageingBuckets: { label: string; count: number }[];
  activeOutages: DtOutage[];
}

export interface AccessRequest {
  requestId: string;
  requestedByName: string;
  requestedRole: Role;
  businessUnit: string;
  referenceUserName?: string;
  justification?: string;
  status: AccessRequestStatus;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface ReportOutagePayload {
  dtId: string;
  outageDate: string;
  outageTime: string;
  faultCategoryId: number;
  faultDescription: string;
  challengeId?: number;
  additionalComment?: string;
}

export interface RestoreOutagePayload {
  outageId: string;
  restorationDate: string;
  restorationTime: string;
  restorationRemarks: string;
  challengeId?: number;
}

export interface SubmitAccessRequestPayload {
  requestedRole: Role;
  businessUnit: string;
  referenceUserId?: string;
  justification?: string;
}
