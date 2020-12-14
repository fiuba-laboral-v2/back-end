import { Admin, Company } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { MissingModeratorMessageError } from "../Errors";
import {
  ApprovedProfileCompanyNotification,
  RejectedProfileCompanyNotification
} from "$models/CompanyNotification";

export const CompanyProfileNotificationFactory = {
  create: (company: Company, admin: Admin, moderatorMessage?: string) => {
    if (company.approvalStatus === ApprovalStatus.approved) {
      return [
        new ApprovedProfileCompanyNotification({
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: company.uuid
        })
      ];
    } else if (company.approvalStatus === ApprovalStatus.rejected) {
      if (!moderatorMessage) throw new MissingModeratorMessageError();
      return [
        new RejectedProfileCompanyNotification({
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: company.uuid,
          moderatorMessage
        })
      ];
    }
    return [];
  }
};
