import { isFromApprovedCompany, isAdmin, isFromApprovedOrRejectedCompany } from "$graphql/Rules";

export const companyNotificationPermissions = {
  Query: {
    getCompanyNotifications: isFromApprovedOrRejectedCompany,
    hasUnreadCompanyNotifications: isFromApprovedCompany,
    getRejectedCompanyProfileMessageByUuid: isAdmin,
    getRejectedOfferMessageByUuid: isAdmin
  }
};
