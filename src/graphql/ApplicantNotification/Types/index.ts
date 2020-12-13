import { GraphQLApplicantNotification } from "./GraphQLApplicantNotification";
import { GraphQLApprovedJobApplicationApplicantNotification } from "./GraphQLApprovedJobApplicationApplicantNotification";
import { GraphQLRejectedJobApplicationApplicantNotification } from "./GraphQLRejectedJobApplicationApplicantNotification";
import { GraphQLApprovedProfileApplicantNotification } from "./GraphQLApprovedProfileApplicantNotification";

export const applicantNotificationTypes = [
  GraphQLApplicantNotification,
  GraphQLApprovedJobApplicationApplicantNotification,
  GraphQLRejectedJobApplicationApplicantNotification,
  GraphQLApprovedProfileApplicantNotification
];
