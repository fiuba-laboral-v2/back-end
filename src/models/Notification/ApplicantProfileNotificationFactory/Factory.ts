import { Admin, Applicant } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { MissingModeratorMessageError } from "..";
import {
  ApprovedProfileApplicantNotification,
  RejectedProfileApplicantNotification
} from "$models/ApplicantNotification";

export const ApplicantProfileNotificationFactory = {
  create: (applicant: Applicant, admin: Admin, moderatorMessage?: string) => {
    if (applicant.approvalStatus === ApprovalStatus.approved) {
      return [
        new ApprovedProfileApplicantNotification({
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: applicant.uuid
        })
      ];
    } else if (applicant.approvalStatus === ApprovalStatus.rejected) {
      if (!moderatorMessage) throw new MissingModeratorMessageError();
      return [
        new RejectedProfileApplicantNotification({
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: applicant.uuid,
          moderatorMessage
        })
      ];
    }
    return [];
  }
};
