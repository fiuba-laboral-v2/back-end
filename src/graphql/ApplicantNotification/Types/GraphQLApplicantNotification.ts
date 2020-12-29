import { GraphQLUnionType } from "graphql";
import { GraphQLPendingJobApplicationApplicantNotification } from "./GraphQLPendingJobApplicationApplicantNotification";
import { GraphQLApprovedJobApplicationApplicantNotification } from "./GraphQLApprovedJobApplicationApplicantNotification";
import { GraphQLRejectedJobApplicationApplicantNotification } from "./GraphQLRejectedJobApplicationApplicantNotification";
import { GraphQLApprovedProfileApplicantNotification } from "./GraphQLApprovedProfileApplicantNotification";
import { GraphQLRejectedProfileApplicantNotification } from "./GraphQLRejectedProfileApplicantNotification";
import { UnknownNotificationError } from "$models/Notification";
import {
  ApplicantNotification,
  PendingJobApplicationApplicantNotification,
  ApprovedJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification,
  ApprovedProfileApplicantNotification,
  RejectedProfileApplicantNotification
} from "$models/ApplicantNotification";

export const GraphQLApplicantNotification = new GraphQLUnionType({
  name: "ApplicantNotification",
  types: [
    GraphQLPendingJobApplicationApplicantNotification,
    GraphQLApprovedJobApplicationApplicantNotification,
    GraphQLRejectedJobApplicationApplicantNotification,
    GraphQLApprovedProfileApplicantNotification,
    GraphQLRejectedProfileApplicantNotification
  ],
  resolveType(notification: ApplicantNotification) {
    const className = notification.constructor.name;
    switch (className) {
      case PendingJobApplicationApplicantNotification.name:
        return GraphQLPendingJobApplicationApplicantNotification;
      case ApprovedJobApplicationApplicantNotification.name:
        return GraphQLApprovedJobApplicationApplicantNotification;
      case RejectedJobApplicationApplicantNotification.name:
        return GraphQLRejectedJobApplicationApplicantNotification;
      case ApprovedProfileApplicantNotification.name:
        return GraphQLApprovedProfileApplicantNotification;
      case RejectedProfileApplicantNotification.name:
        return GraphQLRejectedProfileApplicantNotification;
    }
    throw new UnknownNotificationError(className);
  }
});
