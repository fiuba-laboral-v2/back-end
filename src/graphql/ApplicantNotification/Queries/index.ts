import { getApplicantNotifications } from "./getApplicantNotifications";
import { hasUnreadApplicantNotifications } from "./hasUnreadApplicantNotifications";
import { getRejectedJobApplicationMessageByUuid } from "./getRejectedJobApplicationMessageByUuid";
import { getRejectedApplicantProfileMessageByUuid } from "./getRejectedApplicantProfileMessageByUuid";

export const applicantNotificationQueries = {
  getApplicantNotifications,
  hasUnreadApplicantNotifications,
  getRejectedJobApplicationMessageByUuid,
  getRejectedApplicantProfileMessageByUuid
};
