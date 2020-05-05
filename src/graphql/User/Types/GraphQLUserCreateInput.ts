import { GraphQLInputObjectType } from "graphql";
import { nonNull, String } from "../../fieldTypes";

export const GraphQLUserCreateInput = new GraphQLInputObjectType({
  name: "UserInput",
  fields: () => ({
    email: {
      type: nonNull(String)
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
