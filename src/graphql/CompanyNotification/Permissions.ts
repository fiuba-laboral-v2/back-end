import { isFromApprovedCompany } from "$graphql/Rules";

export const companyNotificationPermissions = {
  Query: {
    getCompanyNotifications: isFromApprovedCompany,
    getCompanyNotificationUnreadCount: isFromApprovedCompany
  }
};
