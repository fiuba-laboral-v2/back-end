import { GraphQLUnionType } from "graphql";
import { GraphQLNewJobApplicationCompanyNotification } from "./GraphQLNewJobApplicationCompanyNotification";
import { GraphQLApprovedOfferCompanyNotification } from "./GraphQLApprovedOfferCompanyNotification";
import { UnknownNotificationError } from "$models/Notification";
import {
  CompanyNotification,
  ApprovedOfferCompanyNotification,
  NewJobApplicationCompanyNotification
} from "$models/CompanyNotification";

export const GraphQLCompanyNotification = new GraphQLUnionType({
  name: "CompanyNotification",
  types: [GraphQLNewJobApplicationCompanyNotification, GraphQLApprovedOfferCompanyNotification],
  resolveType(notification: CompanyNotification) {
    const className = notification.constructor.name;
    switch (className) {
      case ApprovedOfferCompanyNotification.name:
        return GraphQLApprovedOfferCompanyNotification;
      case NewJobApplicationCompanyNotification.name:
        return GraphQLNewJobApplicationCompanyNotification;
    }
    throw new UnknownNotificationError(className);
  }
});
