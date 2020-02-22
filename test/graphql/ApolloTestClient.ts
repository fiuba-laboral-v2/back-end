import { createTestClient } from "apollo-server-testing";
import { IApolloServerContext } from "../../src/App";
import { DocumentNode } from "graphql";
import { ApolloServer as Server } from "apollo-server-express/dist/ApolloServer";
import Schema from "../../src/graphql/Schema";

export const testCurrentUserEmail = "test@test.test";

const LoggedInTestClient = createTestClient(new Server({
  schema: Schema,
  context: () => {
    const apolloServerContext: IApolloServerContext = { currentUserEmail: testCurrentUserEmail };
    return apolloServerContext;
  }
}));

const LoggedOutTestClient = createTestClient(new Server({
  schema: Schema
}));

const client = (loggedIn: boolean) => loggedIn ? LoggedInTestClient : LoggedOutTestClient;

export const executeQuery = (query: DocumentNode, variables?: object, loggedIn = true) => {
  return client(loggedIn).query({
    query: query,
    variables: variables
  });
};

export const executeMutation = (mutation: DocumentNode, variables?: object, loggedIn = true) => {
  return client(loggedIn).mutate({
    mutation: mutation,
    variables: variables
  });
};
