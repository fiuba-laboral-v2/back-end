import { GraphQLUnionType } from "graphql";
import { GraphQLNewJobApplicationCompanyNotification } from "./GraphQLNewJobApplicationCompanyNotification";
import { GraphQLCompanyApprovedOfferNotification } from "./GraphQLCompanyApprovedOfferNotification";
import {
  CompanyNotification,
  ApprovedOfferCompanyNotification,
  NewJobApplicationCompanyNotification,
  UnknownNotificationError
} from "$models/CompanyNotification";

export const GraphQLCompanyNotification = new GraphQLUnionType({
  name: "CompanyNotification",
  types: [GraphQLNewJobApplicationCompanyNotification, GraphQLCompanyApprovedOfferNotification],
  resolveType(notification: CompanyNotification) {
    const className = notification.constructor.name;
    switch (className) {
      case ApprovedOfferCompanyNotification.name:
        return GraphQLCompanyApprovedOfferNotification;
      case NewJobApplicationCompanyNotification.name:
        return GraphQLNewJobApplicationCompanyNotification;
    }
    throw new UnknownNotificationError(className);
  }
});
