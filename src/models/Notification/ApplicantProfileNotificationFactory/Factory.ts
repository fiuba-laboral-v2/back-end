import { Admin, Applicant } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApprovedProfileApplicantNotification } from "$models/ApplicantNotification";

export const ApplicantProfileNotificationFactory = {
  create: (applicant: Applicant, admin: Admin) => {
    if (applicant.approvalStatus === ApprovalStatus.approved) {
      return [
        new ApprovedProfileApplicantNotification({
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: applicant.uuid
        })
      ];
    }
    return [];
  }
};
