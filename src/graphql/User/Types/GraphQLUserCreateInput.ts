import { GraphQLInputObjectType } from "graphql";
import { nonNull, String } from "$graphql/fieldTypes";

export const GraphQLUserCreateInput = new GraphQLInputObjectType({
  name: "UserInput",
  fields: () => ({
    email: {
      type: nonNull(String)
    },
    dni: {
      type: String
    },
    password: {
      type: nonNull(String)
    },
    name: {
      type: nonNull(String)
    },
    surname: {
      type: nonNull(String)
    }
  })
});
