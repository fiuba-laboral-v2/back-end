import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { applyMiddleware } from "graphql-middleware";
import queries from "./queries";
import mutations from "./mutations";
import types from "./types";
import permissions from "./permissions";

const Schema: GraphQLSchema = new GraphQLSchema({
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

const { schema } = applyMiddleware(Schema, permissions);

export default schema;
