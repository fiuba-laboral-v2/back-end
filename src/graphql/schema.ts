import { GraphQLObjectType, GraphQLSchema } from "graphql";
import queries from "./queries";
import mutations from "./mutations";
import types from "./types";

const schema: GraphQLSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: queries
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: mutations
  }),
  types: types
});

export default schema;
