import { GraphQLUnionType } from "graphql";
import { GraphQLApprovedJobApplicationApplicantNotification } from "./GraphQLApprovedJobApplicationApplicantNotification";
import { GraphQLRejectedJobApplicationApplicantNotification } from "./GraphQLRejectedJobApplicationApplicantNotification";
import { GraphQLApprovedProfileApplicantNotification } from "./GraphQLApprovedProfileApplicantNotification";
import { GraphQLRejectedProfileApplicantNotification } from "./GraphQLRejectedProfileApplicantNotification";
import { UnknownNotificationError } from "$models/Notification";
import {
  ApplicantNotification,
  ApprovedJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification,
  ApprovedProfileApplicantNotification,
  RejectedProfileApplicantNotification
} from "$models/ApplicantNotification";

export const GraphQLApplicantNotification = new GraphQLUnionType({
  name: "ApplicantNotification",
  types: [
    GraphQLApprovedJobApplicationApplicantNotification,
    GraphQLRejectedJobApplicationApplicantNotification,
    GraphQLApprovedProfileApplicantNotification,
    GraphQLRejectedProfileApplicantNotification
  ],
  resolveType(notification: ApplicantNotification) {
    const className = notification.constructor.name;
    switch (className) {
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
