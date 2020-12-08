import { GraphQLUnionType } from "graphql";
import { GraphQLApprovedJobApplicationApplicantNotification } from "./GraphQLApprovedJobApplicationApplicantNotification";
import {
  ApplicantNotification,
  ApprovedJobApplicationApplicantNotification
} from "$models/ApplicantNotification";

export const GraphQLApplicantNotification = new GraphQLUnionType({
  name: "ApplicantNotification",
  types: [GraphQLApprovedJobApplicationApplicantNotification],
  resolveType(notification: ApplicantNotification) {
    const className = notification.constructor.name;
    switch (className) {
      case ApprovedJobApplicationApplicantNotification.name:
        return GraphQLApprovedJobApplicationApplicantNotification;
    }
    throw new Error(className);
  }
});
