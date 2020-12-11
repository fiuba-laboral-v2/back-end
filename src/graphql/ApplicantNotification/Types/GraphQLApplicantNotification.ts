import { GraphQLUnionType } from "graphql";
import { GraphQLApprovedJobApplicationApplicantNotification } from "./GraphQLApprovedJobApplicationApplicantNotification";
import { GraphQLRejectedJobApplicationApplicantNotification } from "./GraphQLRejectedJobApplicationApplicantNotification";
import { UnknownNotificationError } from "$models/Notification";
import {
  ApplicantNotification,
  ApprovedJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification
} from "$models/ApplicantNotification";

export const GraphQLApplicantNotification = new GraphQLUnionType({
  name: "ApplicantNotification",
  types: [
    GraphQLApprovedJobApplicationApplicantNotification,
    GraphQLRejectedJobApplicationApplicantNotification
  ],
  resolveType(notification: ApplicantNotification) {
    const className = notification.constructor.name;
    switch (className) {
      case ApprovedJobApplicationApplicantNotification.name:
        return GraphQLApprovedJobApplicationApplicantNotification;
      case RejectedJobApplicationApplicantNotification.name:
        return GraphQLRejectedJobApplicationApplicantNotification;
    }
    throw new UnknownNotificationError(className);
  }
});
