import { GraphQLUnionType } from "graphql";
import { GraphQLNewJobApplicationCompanyNotification } from "./GraphQLNewJobApplicationCompanyNotification";
import { GraphQLApprovedOfferCompanyNotification } from "./GraphQLApprovedOfferCompanyNotification";
import { GraphQLRejectedOfferCompanyNotification } from "./GraphQLRejectedOfferCompanyNotification";
import { GraphQLApprovedProfileCompanyNotification } from "./GraphQLApprovedProfileCompanyNotification";
import { GraphQLRejectedProfileCompanyNotification } from "./GraphQLRejectedProfileCompanyNotification";
import { UnknownNotificationError } from "$models/Notification";
import {
  CompanyNotification,
  ApprovedOfferCompanyNotification,
  NewJobApplicationCompanyNotification,
  RejectedOfferCompanyNotification,
  ApprovedProfileCompanyNotification,
  RejectedProfileCompanyNotification
} from "$models/CompanyNotification";

export const GraphQLCompanyNotification = new GraphQLUnionType({
  name: "CompanyNotification",
  types: [
    GraphQLNewJobApplicationCompanyNotification,
    GraphQLApprovedOfferCompanyNotification,
    GraphQLRejectedOfferCompanyNotification,
    GraphQLApprovedProfileCompanyNotification,
    GraphQLRejectedProfileCompanyNotification
  ],
  resolveType(notification: CompanyNotification) {
    const className = notification.constructor.name;
    switch (className) {
      case ApprovedOfferCompanyNotification.name:
        return GraphQLApprovedOfferCompanyNotification;
      case NewJobApplicationCompanyNotification.name:
        return GraphQLNewJobApplicationCompanyNotification;
      case RejectedOfferCompanyNotification.name:
        return GraphQLRejectedOfferCompanyNotification;
      case ApprovedProfileCompanyNotification.name:
        return GraphQLApprovedProfileCompanyNotification;
      case RejectedProfileCompanyNotification.name:
        return GraphQLRejectedProfileCompanyNotification;
    }
    throw new UnknownNotificationError(className);
  }
});
