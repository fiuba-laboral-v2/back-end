import { GraphQLObjectType } from "graphql";
import { ID, nonNull, String } from "$graphql/fieldTypes";

const rootType = new GraphQLObjectType({
  name: "Root",
  fields: () => ({
    id: {
      type: ID
    },
    title: {
      type: nonNull(String)
    }
  })
});

export default rootType;
