import { isFromApprovedCompany, isAdmin } from "$graphql/Rules";

export const companyNotificationPermissions = {
  Query: {
    getCompanyNotifications: isFromApprovedCompany,
    hasUnreadCompanyNotifications: isFromApprovedCompany,
    getRejectedCompanyProfileMessageByUuid: isAdmin,
    getRejectedOfferMessageByUuid: isAdmin
  }
};
