import { isAdmin, isFromApprovedOrRejectedCompany } from "$graphql/Rules";

export const companyNotificationPermissions = {
  Query: {
    getCompanyNotifications: isFromApprovedOrRejectedCompany,
    hasUnreadCompanyNotifications: isFromApprovedOrRejectedCompany,
    getRejectedCompanyProfileMessageByUuid: isAdmin,
    getRejectedOfferMessageByUuid: isAdmin
  }
};
