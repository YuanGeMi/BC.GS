import { ComplaintStatus, ReportType } from "@/lib/db-enums";

/** Every status, in the order the admin lists them. `open` is legacy: it stays in the enum, but the complaint_status_by_type check constraint rejects it. */
export const COMPLAINT_STATUSES: readonly ComplaintStatus[] = [
  ComplaintStatus.open,
  ComplaintStatus.submitted,
  ComplaintStatus.received,
  ComplaintStatus.in_review,
  ComplaintStatus.waiting_for_more_information,
  ComplaintStatus.resolved,
  ComplaintStatus.rejected,
  ComplaintStatus.verified,
  ComplaintStatus.not_verified,
  ComplaintStatus.closed,
];

/** Statuses staff may set, per report type. */
export const ALLOWED_COMPLAINT_STATUSES: Record<
  ReportType,
  readonly ComplaintStatus[]
> = {
  [ReportType.complaint]: [
    ComplaintStatus.submitted,
    ComplaintStatus.in_review,
    ComplaintStatus.waiting_for_more_information,
    ComplaintStatus.resolved,
    ComplaintStatus.rejected,
    ComplaintStatus.closed,
  ],
  [ReportType.scam_report]: [
    ComplaintStatus.received,
    ComplaintStatus.in_review,
    ComplaintStatus.verified,
    ComplaintStatus.not_verified,
    ComplaintStatus.closed,
  ],
};

export function isComplaintStatus(value: string): value is ComplaintStatus {
  return (COMPLAINT_STATUSES as readonly string[]).includes(value);
}

export function isAllowedComplaintStatus(
  type: ReportType,
  status: string,
): status is ComplaintStatus {
  return (ALLOWED_COMPLAINT_STATUSES[type] as readonly string[]).includes(
    status,
  );
}

/** Dropdown options: the type's allowed list, plus the current value first when it is outside that list (e.g. legacy open). */
export function complaintStatusOptions(
  type: ReportType,
  current: ComplaintStatus,
): ComplaintStatus[] {
  const allowed = ALLOWED_COMPLAINT_STATUSES[type];
  return allowed.includes(current) ? [...allowed] : [current, ...allowed];
}
