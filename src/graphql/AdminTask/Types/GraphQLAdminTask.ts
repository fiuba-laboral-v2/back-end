import { GraphQLUnionType } from "graphql";
import { GraphQLCompany } from "$graphql/Company/Types/GraphQLCompany";
import { GraphQLApplicant } from "$graphql/Applicant/Types/GraphQLApplicant";
import { GraphQLOffer } from "$graphql/Offer/Types/GraphQLOffer";
import { Applicant, Company, Offer } from "$models";

export const GraphQLAdminTask = new GraphQLUnionType({
  name: "AdminTask",
  types: [GraphQLCompany, GraphQLApplicant, GraphQLOffer],
  resolveType(value) {
    if (value instanceof Company) return GraphQLCompany;
    if (value instanceof Applicant) return GraphQLApplicant;
    if (value instanceof Offer) return GraphQLOffer;
    throw new Error("Value is not of AdminTask type");
  }
});
