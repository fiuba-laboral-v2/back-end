import { createTestClient } from "apollo-server-testing";
import { apolloServer } from "../../src/app";
import { DocumentNode } from "graphql";

const testClient = createTestClient(apolloServer as any);

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
