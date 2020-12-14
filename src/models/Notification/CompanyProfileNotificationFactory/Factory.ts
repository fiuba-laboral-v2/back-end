import { Admin, Company } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApprovedProfileCompanyNotification } from "$models/CompanyNotification";

export const CompanyProfileNotificationFactory = {
  create: (company: Company, admin: Admin) => {
    if (company.approvalStatus === ApprovalStatus.approved) {
      return [
        new ApprovedProfileCompanyNotification({
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: company.uuid
        })
      ];
    }
    return [];
  }
};
