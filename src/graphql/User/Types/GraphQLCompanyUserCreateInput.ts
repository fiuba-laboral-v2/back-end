import { GraphQLInputObjectType } from "graphql";
import { nonNull, String } from "$graphql/fieldTypes";

export const GraphQLCompanyUserCreateInput = new GraphQLInputObjectType({
  name: "CompanyUserCreateInput",
  fields: () => ({
    name: {
      type: nonNull(String)
    },
    surname: {
      type: nonNull(String)
    },
    email: {
      type: nonNull(String)
    },
    password: {
      type: nonNull(String)
    },
    position: {
      type: nonNull(String)
    }
  })
});
