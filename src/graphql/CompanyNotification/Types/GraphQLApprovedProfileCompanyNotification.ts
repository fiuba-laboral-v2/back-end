import { GraphQLObjectType } from "graphql";
import { GraphQLGenericCompanyNotificationFields } from "./GraphQLGenericCompanyNotificationFields";
import { ApprovedProfileCompanyNotification } from "$models/CompanyNotification";

export const GraphQLApprovedProfileCompanyNotification = new GraphQLObjectType<
  ApprovedProfileCompanyNotification
>({
  name: "ApprovedProfileCompanyNotification",
  fields: () => GraphQLGenericCompanyNotificationFields
});
