import { GraphQLUnionType } from "graphql";
import { GraphQLCompany } from "$graphql/Company/Types/GraphQLCompany";
import { GraphQLApplicant } from "$graphql/Applicant/Types/GraphQLApplicant";
import { GraphQLOffer } from "$graphql/Offer/Types/GraphQLOffer";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";
import { Applicant, Company, Offer, JobApplication } from "$models";

export const GraphQLAdminTask = new GraphQLUnionType({
  name: "AdminTask",
  types: [GraphQLCompany, GraphQLApplicant, GraphQLOffer, GraphQLJobApplication],
  resolveType(value) {
    if (value instanceof Company) return GraphQLCompany;
    if (value instanceof Applicant) return GraphQLApplicant;
    if (value instanceof Offer) return GraphQLOffer;
    if (value instanceof JobApplication) return GraphQLJobApplication;
    throw new Error("Value is not of AdminTask type");
  }
});
