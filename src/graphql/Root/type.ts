import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";

const rootType = new GraphQLObjectType({
  name: "Root",
  fields: () => ({
    id: {
      type: GraphQLID
    },
    title: {
      type: GraphQLNonNull(GraphQLString)
    }
  })
});

export default rootType;
