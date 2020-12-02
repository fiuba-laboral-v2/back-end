import { GraphQLUnionType } from "graphql";
import { GraphQLCompanyNewJobApplicationNotification } from "./GraphQLCompanyNewJobApplicationNotification";
import { GraphQLCompanyApprovedOfferNotification } from "./GraphQLCompanyApprovedOfferNotification";
import {
  TCompanyNotification,
  CompanyApprovedOfferNotification
} from "$models/CompanyNotification";

export const GraphQLCompanyNotification = new GraphQLUnionType({
  name: "CompanyNotification",
  types: [GraphQLCompanyNewJobApplicationNotification, GraphQLCompanyApprovedOfferNotification],
  resolveType(notification: TCompanyNotification) {
    if (notification instanceof CompanyApprovedOfferNotification) {
      return GraphQLCompanyApprovedOfferNotification;
    }
    return GraphQLCompanyNewJobApplicationNotification;
  }
});
