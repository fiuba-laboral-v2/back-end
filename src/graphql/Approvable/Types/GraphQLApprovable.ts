import { GraphQLUnionType } from "graphql";
import { GraphQLCompany } from "../../Company/Types/GraphQLCompany";
import { Company } from "../../../models/Company";

export const GraphQLApprovable = new GraphQLUnionType({
  name: "Approvable",
  types: [GraphQLCompany],
  resolveType(value) {
    if (value instanceof Company) return GraphQLCompany;
    throw new Error("Value is not of an Approvable type");
  }
});
