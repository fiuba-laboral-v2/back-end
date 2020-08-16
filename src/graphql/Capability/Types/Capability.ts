import { GraphQLObjectType } from "graphql";
import { ID, nonNull, String } from "$graphql/fieldTypes";

export const GraphQLCapability = new GraphQLObjectType({
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
