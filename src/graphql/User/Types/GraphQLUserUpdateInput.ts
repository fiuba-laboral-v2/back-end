import { GraphQLInputObjectType } from "graphql";
import { nonNull, String } from "$graphql/fieldTypes";

export const GraphQLUserUpdateInput = new GraphQLInputObjectType({
  name: "UserUpdateInput",
  fields: () => ({
    email: {
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
