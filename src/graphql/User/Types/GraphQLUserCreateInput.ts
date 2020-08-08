import { GraphQLInputObjectType } from "graphql";
import { nonNull, String, Int } from "$graphql/fieldTypes";

export const GraphQLUserCreateInput = new GraphQLInputObjectType({
  name: "UserInput",
  fields: () => ({
    email: {
      type: nonNull(String)
    },
    dni: {
      type: Int
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
