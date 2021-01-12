import { getApplicantNotifications } from "./getApplicantNotifications";
import { hasUnreadApplicantNotifications } from "./hasUnreadApplicantNotifications";
import { getRejectedJobApplicationMessageByUuid } from "./getRejectedJobApplicationMessageByUuid";

export const applicantNotificationQueries = {
  getApplicantNotifications,
  hasUnreadApplicantNotifications,
  getRejectedJobApplicationMessageByUuid
};
