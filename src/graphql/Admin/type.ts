import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";

const adminType = new GraphQLObjectType({
  name: "Admin",
  fields: () => ({
    id: {
      type: GraphQLID
    },
    name: {
      type: GraphQLNonNull(GraphQLString)
    },
    surname: {
      type: GraphQLNonNull(GraphQLString)
    },
    age: {
      type: GraphQLInt
    }
  })
});

export default adminType;
