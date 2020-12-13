import { GraphQLUnionType } from "graphql";
import { GraphQLApprovedJobApplicationApplicantNotification } from "./GraphQLApprovedJobApplicationApplicantNotification";
import { GraphQLRejectedJobApplicationApplicantNotification } from "./GraphQLRejectedJobApplicationApplicantNotification";
import { GraphQLApprovedProfileApplicantNotification } from "./GraphQLApprovedProfileApplicantNotification";
import { UnknownNotificationError } from "$models/Notification";
import {
  ApplicantNotification,
  ApprovedJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification,
  ApprovedProfileApplicantNotification
} from "$models/ApplicantNotification";

export const GraphQLApplicantNotification = new GraphQLUnionType({
  name: "ApplicantNotification",
  types: [
    GraphQLApprovedJobApplicationApplicantNotification,
    GraphQLRejectedJobApplicationApplicantNotification,
    GraphQLApprovedProfileApplicantNotification
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
    }
    throw new UnknownNotificationError(className);
  }
});
