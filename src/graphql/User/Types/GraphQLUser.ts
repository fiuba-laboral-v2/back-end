import { GraphQLObjectType } from "graphql";
import { nonNull, String } from "../../fieldTypes";

const GraphQLUser = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    email: {
      type: nonNull(String)
    }
  })
});

export { GraphQLUser };
