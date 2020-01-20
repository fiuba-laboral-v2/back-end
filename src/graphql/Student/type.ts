import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";

const studentType = new GraphQLObjectType({
  name: "Student",
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

export default studentType;
