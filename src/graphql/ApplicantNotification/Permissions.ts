import { isApprovedApplicant, isAdmin, isApprovedOrRejectedApplicant } from "$graphql/Rules";

export const applicantNotificationPermissions = {
  Query: {
    getApplicantNotifications: isApprovedOrRejectedApplicant,
    hasUnreadApplicantNotifications: isApprovedApplicant,
    getRejectedJobApplicationMessageByUuid: isAdmin,
    getRejectedApplicantProfileMessageByUuid: isAdmin
  }
};
