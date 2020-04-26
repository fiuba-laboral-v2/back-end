import { createTestClient } from "apollo-server-testing";
import { apolloErrorConverter } from "../../src/FormatErrors";
import { IApolloServerContext } from "../../src/server";
import { DocumentNode } from "graphql";
import { ApolloServer as Server } from "apollo-server-express/dist/ApolloServer";
import Schema from "../../src/graphql/Schema";

export const testCurrentUserEmail = "test@test.test";
export const testCurrentUserUuid = "5bca6c9d-8367-4500-be05-0db55066b2a1";

const LoggedInTestClient = createTestClient(new Server({
  schema: Schema,
  formatError: apolloErrorConverter({ logger: false }),
  context: () => {
    const apolloServerContext: IApolloServerContext = {
      currentUser: {
        uuid: testCurrentUserUuid,
        email: testCurrentUserEmail
      }
    };
    return apolloServerContext;
  }
}));

const LoggedOutTestClient = createTestClient(new Server({
  schema: Schema,
  formatError: apolloErrorConverter({ logger: false })
}));

const client = (loggedIn: boolean) => loggedIn ? LoggedInTestClient : LoggedOutTestClient;

export const executeQuery = (
  query: DocumentNode,
  variables?: object,
  { loggedIn }: { loggedIn: boolean } = { loggedIn: true }
) => {
  return client(loggedIn).query({
    query: query,
    variables: variables
  });
};

export const executeMutation = (
  mutation: DocumentNode,
  variables?: object,
  { loggedIn }: { loggedIn: boolean } = { loggedIn: true }
) => {
  return client(loggedIn).mutate({
    mutation: mutation,
    variables: variables
  });
};
