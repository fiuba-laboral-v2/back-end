import { getCompanyNotifications } from "./getCompanyNotifications";
import { hasUnreadCompanyNotifications } from "./hasUnreadCompanyNotifications";
import { getRejectedCompanyProfileMessageByUuid } from "./getRejectedCompanyProfileMessageByUuid";

export const companyNotificationQueries = {
  getCompanyNotifications,
  hasUnreadCompanyNotifications,
  getRejectedCompanyProfileMessageByUuid
};
