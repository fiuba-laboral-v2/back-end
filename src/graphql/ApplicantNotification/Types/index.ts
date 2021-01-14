import { GraphQLApplicantNotification } from "./GraphQLApplicantNotification";
import { GraphQLPendingJobApplicationApplicantNotification } from "./GraphQLPendingJobApplicationApplicantNotification";
import { GraphQLApprovedJobApplicationApplicantNotification } from "./GraphQLApprovedJobApplicationApplicantNotification";
import { GraphQLRejectedJobApplicationApplicantNotification } from "./GraphQLRejectedJobApplicationApplicantNotification";
import { GraphQLApprovedProfileApplicantNotification } from "./GraphQLApprovedProfileApplicantNotification";
import { GraphQLRejectedProfileApplicantNotification } from "./GraphQLRejectedProfileApplicantNotification";
import { GraphQLHasUnreadApplicantNotifications } from "./GraphQLHasUnreadApplicantNotifications";

export const applicantNotificationTypes = [
  GraphQLApplicantNotification,
  GraphQLPendingJobApplicationApplicantNotification,
  GraphQLApprovedJobApplicationApplicantNotification,
  GraphQLRejectedJobApplicationApplicantNotification,
  GraphQLApprovedProfileApplicantNotification,
  GraphQLRejectedProfileApplicantNotification,
  GraphQLHasUnreadApplicantNotifications
];
