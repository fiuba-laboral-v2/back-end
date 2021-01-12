import { isApprovedApplicant, isAdmin } from "$graphql/Rules";

export const applicantNotificationPermissions = {
  Query: {
    getApplicantNotifications: isApprovedApplicant,
    hasUnreadApplicantNotifications: isApprovedApplicant,
    getRejectedJobApplicationMessageByUuid: isAdmin
  }
};
