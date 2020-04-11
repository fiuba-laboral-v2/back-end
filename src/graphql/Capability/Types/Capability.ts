import { GraphQLObjectType } from "graphql";
import { ID, nonNull, String } from "../../fieldTypes";

const GraphQLCapability = new GraphQLObjectType({
  name: "Capability",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    description: {
      type: String
    }
  })
});

export { GraphQLCapability };
