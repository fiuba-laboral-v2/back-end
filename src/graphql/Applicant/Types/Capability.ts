import { GraphQLObjectType } from "graphql";
import { ID, Int, nonNull, String, List } from "../../fieldTypes";

const GraphQLCapability = new GraphQLObjectType({
  name: "Capability",
  fields: () => ({
    uuid: {
      type: ID
    },
    description: {
      type: String
    }
  })
});

export { GraphQLCapability };
