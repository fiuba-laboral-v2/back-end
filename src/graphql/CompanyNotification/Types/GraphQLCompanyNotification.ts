import { GraphQLUnionType } from "graphql";
import { GraphQLCompanyNewJobApplicationNotification } from "./GraphQLCompanyNewJobApplicationNotification";
import { GraphQLCompanyApprovedOfferNotification } from "./GraphQLCompanyApprovedOfferNotification";
import {
  CompanyNotification,
  CompanyApprovedOfferNotification,
  CompanyNewJobApplicationNotification,
  UnknownNotificationError
} from "$models/CompanyNotification";

export const GraphQLCompanyNotification = new GraphQLUnionType({
  name: "CompanyNotification",
  types: [GraphQLCompanyNewJobApplicationNotification, GraphQLCompanyApprovedOfferNotification],
  resolveType(notification: CompanyNotification) {
    const className = notification.constructor.name;
    switch (className) {
      case CompanyApprovedOfferNotification.name:
        return GraphQLCompanyApprovedOfferNotification;
      case CompanyNewJobApplicationNotification.name:
        return GraphQLCompanyNewJobApplicationNotification;
    }
    throw new UnknownNotificationError(className);
  }
});
