import { getCompanyNotifications } from "./getCompanyNotifications";
import { hasUnreadCompanyNotifications } from "./hasUnreadCompanyNotifications";
import { getRejectedCompanyProfileMessageByUuid } from "./getRejectedCompanyProfileMessageByUuid";
import { getRejectedOfferMessageByUuid } from "./getRejectedOfferMessageByUuid";

export const companyNotificationQueries = {
  getCompanyNotifications,
  hasUnreadCompanyNotifications,
  getRejectedCompanyProfileMessageByUuid,
  getRejectedOfferMessageByUuid
};
