import { GraphQLInputObjectType } from "graphql";
import { nonNull, String } from "../../fieldTypes";

export const GraphQLUserInput = new GraphQLInputObjectType({
  name: "UserInput",
  fields: () => ({
    email: {
      type: nonNull(String)
    },
    password: {
      type: nonNull(String)
    }
  })
});
