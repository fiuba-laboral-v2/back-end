import { GraphQLInputObjectType } from "graphql";
import { nonNull, String } from "../../fieldTypes";

export const GraphQLUserUpdateInput = new GraphQLInputObjectType({
  name: "UserUpdateInput",
  fields: () => ({
    name: {
      type: nonNull(String)
    },
    surname: {
      type: nonNull(String)
    }
  })
});
