import { GraphQLUnionType } from "graphql";
import { GraphQLCompanyNewJobApplicationNotification } from "./GraphQLCompanyNewJobApplicationNotification";
import { TCompanyNotification } from "$models/CompanyNotification";

export const GraphQLCompanyNotification = new GraphQLUnionType({
  name: "CompanyNotification",
  types: [GraphQLCompanyNewJobApplicationNotification],
  resolveType(_: TCompanyNotification) {
    return GraphQLCompanyNewJobApplicationNotification;
  }
});
