import { GraphQLObjectType } from "graphql";
import { ID, String, nonNull } from "../field_types";

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
