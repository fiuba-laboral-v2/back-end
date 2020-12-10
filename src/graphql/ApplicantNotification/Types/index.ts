import { GraphQLApplicantNotification } from "./GraphQLApplicantNotification";
import { GraphQLApprovedJobApplicationApplicantNotification } from "./GraphQLApprovedJobApplicationApplicantNotification";
import { GraphQLRejectedJobApplicationApplicantNotification } from "./GraphQLRejectedJobApplicationApplicantNotification";

export const applicantNotificationTypes = [
  GraphQLApplicantNotification,
  GraphQLApprovedJobApplicationApplicantNotification,
  GraphQLRejectedJobApplicationApplicantNotification
];
