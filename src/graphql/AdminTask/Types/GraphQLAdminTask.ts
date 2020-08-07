import { GraphQLUnionType } from "graphql";
import { GraphQLCompany } from "$graphql/Company/Types/GraphQLCompany";
import { GraphQLApplicant } from "$graphql/Applicant/Types/GraphQLApplicant";
import { Applicant, Company } from "$models";

export const GraphQLAdminTask = new GraphQLUnionType({
  name: "AdminTask",
  types: [GraphQLCompany, GraphQLApplicant],
  resolveType(value) {
    if (value instanceof Company) return GraphQLCompany;
    if (value instanceof Applicant) return GraphQLApplicant;
    throw new Error("Value is not of AdminTask type");
  }
});
