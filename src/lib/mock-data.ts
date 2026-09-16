import type {
  AccessRequest,
  ChallengeCategory,
  DashboardSummary,
  DtOutage,
  FaultCategory,
  UserSummary,
} from "./types";

export const mockCurrentUser: UserSummary = {
  userId: "u-1001",
  fullName: "Tunde A.",
  email: "tunde.a@ikejaelectric.com",
  role: "USER",
  businessUnit: "Ikeja BU",
  isActive: true,
};

export const mockFaultCategories: FaultCategory[] = [
  { categoryId: 1, categoryName: "Failed DT" },
  { categoryId: 2, categoryName: "Ruptured Fuse" },
  { categoryId: 3, categoryName: "Cable Fault" },
  { categoryId: 4, categoryName: "Vandalism" },
  { categoryId: 5, categoryName: "Oil Leakage" },
  { categoryId: 6, categoryName: "Vehicular Collision" },
  { categoryId: 7, categoryName: "Open Circuit" },
  { categoryId: 8, categoryName: "Low Voltage" },
  { categoryId: 9, categoryName: "Low Insulation" },
  { categoryId: 10, categoryName: "Broken Pole" },
  { categoryId: 11, categoryName: "Plinth Reconstruction" },
  { categoryId: 12, categoryName: "Other" },
];

export const mockChallengeCategories: ChallengeCategory[] = [
  { challengeId: 1, challengeName: "No replacement DT available" },
  { challengeId: 2, challengeName: "No fuse/material available" },
  { challengeId: 3, challengeName: "Transportation issue" },
  { challengeId: 4, challengeName: "Manpower unavailable" },
  { challengeId: 5, challengeName: "Funding/approval delay" },
  { challengeId: 6, challengeName: "Access/location issue" },
  { challengeId: 7, challengeName: "Security issue" },
  { challengeId: 8, challengeName: "Customer-related issue" },
  { challengeId: 9, challengeName: "Awaiting technical team" },
  { challengeId: 10, challengeName: "Other" },
];

export const mockActiveOutages: DtOutage[] = [
  {
    outageId: "o-1",
    outageRef: "OUT-2026-00042",
    dtId: "dt-1",
    dtCodeSnapshot: "DT-0234-LG",
    businessUnitSnapshot: "Ikeja BU",
    undertakingSnapshot: "Alausa",
    feederSnapshot: "Opebi F1 (11kV HT Route)",
    capacitySnapshot: 500,
    bandSnapshot: "B",
    outageDatetime: "2026-09-08T14:30:00Z",
    faultCategory: "Ruptured Fuse",
    faultDescription: "Fuse ruptured following storm, DT tripped",
    restorationChallenge: "No fuse/material available",
    status: "OUT",
    ageDays: 2,
    ageingBucket: "0-2 days",
    reportedByName: "Tunde A.",
  },
  {
    outageId: "o-2",
    outageRef: "OUT-2026-00038",
    dtId: "dt-2",
    dtCodeSnapshot: "DT-0188-LG",
    businessUnitSnapshot: "Ikeja BU",
    undertakingSnapshot: "Allen",
    feederSnapshot: "Allen 11kV Feeder",
    capacitySnapshot: 300,
    bandSnapshot: "B",
    outageDatetime: "2026-08-27T09:10:00Z",
    faultCategory: "Cable Fault",
    faultDescription: "Cable Fault (Buried) — jointing team dispatched",
    restorationChallenge: "Awaiting technical team",
    status: "OUT",
    ageDays: 14,
    ageingBucket: "13-25 days",
    reportedByName: "Ngozi O.",
  },
];

export const mockDashboardSummary: DashboardSummary = {
  outNow: 18,
  restoredToday: 4,
  restoredTodayDeltaPct: 22,
  oldestOutageAgeDays: 14,
  oldestOutageDtCode: "DT-0188-LG",
  ageingBuckets: [
    { label: "0-2 days", count: 6 },
    { label: "3-5 days", count: 5 },
    { label: "6-12 days", count: 4 },
    { label: "13-25 days", count: 2 },
    { label: "26-30 days", count: 1 },
  ],
  activeOutages: mockActiveOutages,
};

export const mockAccessRequests: AccessRequest[] = [
  {
    requestId: "ar-1",
    requestedByName: "Grace N.",
    requestedRole: "ADMIN",
    businessUnit: "Ikeja BU",
    referenceUserName: "Ngozi O. (Admin, Ikeja BU)",
    justification: "Taking over BU-level report review from Ngozi.",
    status: "PENDING",
    createdAt: "2026-09-09T08:00:00Z",
  },
  {
    requestId: "ar-2",
    requestedByName: "Femi K.",
    requestedRole: "USER",
    businessUnit: "Ikeja BU",
    referenceUserName: "Tunde A. (User, Ikeja BU)",
    justification: "New field staff, Opebi crew.",
    status: "PENDING",
    createdAt: "2026-09-09T10:20:00Z",
  },
];
