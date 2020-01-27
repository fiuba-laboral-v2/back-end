import { createTestClient } from "apollo-server-testing";
import { ApolloServer } from "../../src/App";
import { DocumentNode } from "graphql";

const testClient = createTestClient(ApolloServer as any);

const executeQuery = (query: DocumentNode, variables?: object) => {
  return testClient.query({
    query: query,
    variables: variables
  });
};

const executeMutation = (mutation: DocumentNode, variables?: object) => {
  return testClient.mutate({
    mutation: mutation,
    variables: variables
  });
};

export { executeQuery, executeMutation };
