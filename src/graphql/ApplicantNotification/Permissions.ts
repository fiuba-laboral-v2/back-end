import { isApprovedApplicant } from "$graphql/Rules";

export const applicantNotificationPermissions = {
  Query: {
    getApplicantNotifications: isApprovedApplicant,
    hasUnreadApplicantNotifications: isApprovedApplicant
  }
};
