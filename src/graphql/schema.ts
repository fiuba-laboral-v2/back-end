import { GraphQLSchema } from "graphql";
import { makeExecutableSchema } from "graphql-tools";
import typeDefs from "./typesBuilder";
import resolvers from "./resolversBuilder";

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers
});

export default schema;
