import { GraphQLInputObjectType } from "graphql";
import { nonNull, String, ID } from "$graphql/fieldTypes";

export const GraphQLCompanyUserUpdateInput = new GraphQLInputObjectType({
  name: "CompanyUserUpdateInput",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    name: {
      type: nonNull(String)
    },
    surname: {
      type: nonNull(String)
    },
    email: {
      type: nonNull(String)
    },
    position: {
      type: nonNull(String)
    }
  })
});
