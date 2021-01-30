import { isAdmin, isApprovedOrRejectedApplicant } from "$graphql/Rules";

export const applicantNotificationPermissions = {
  Query: {
    getApplicantNotifications: isApprovedOrRejectedApplicant,
    hasUnreadApplicantNotifications: isApprovedOrRejectedApplicant,
    getRejectedJobApplicationMessageByUuid: isAdmin,
    getRejectedApplicantProfileMessageByUuid: isAdmin
  }
};
