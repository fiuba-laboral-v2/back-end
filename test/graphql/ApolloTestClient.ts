import { createTestClient } from "apollo-server-testing";
import { apolloErrorConverter } from "../../src/FormatErrors";
import { IApolloServerContext, ICurrentUser } from "../../src/server";
import { DocumentNode } from "graphql";
import { ApolloServer as Server } from "apollo-server-express/dist/ApolloServer";
import Schema from "../../src/graphql/Schema";

export const testCurrentUserEmail = "test@test.test";
export const defaulttUserUuid = "5bca6c9d-8367-4500-be05-0db55066b2a1";
export const defaultApplicantUuid = "f1866416-bbb7-4890-9c19-603ac02c3dec";

const LoggedInTestClient = ({
  uuid,
  email,
  applicantUuid
  }: ICurrentUser) => createTestClient(new Server({
    schema: Schema,
    formatError: apolloErrorConverter({ logger: false }),
    context: () => {
      const apolloServerContext: IApolloServerContext = {
        currentUser: {
          uuid,
          email,
          applicantUuid
        }
      };
      return apolloServerContext;
    }
  }));

const LoggedOutTestClient = createTestClient(new Server({
  schema: Schema,
  formatError: apolloErrorConverter({ logger: false })
}));

const defaultClient = (loggedIn: boolean) => loggedIn ? LoggedInTestClient({
  uuid: defaulttUserUuid,
  email: testCurrentUserEmail,
  applicantUuid: defaultApplicantUuid
}) : LoggedOutTestClient;

export const executeQuery = (
  query: DocumentNode,
  variables?: object,
  { loggedIn }: { loggedIn: boolean } = { loggedIn: true }
) => {
  return defaultClient(loggedIn).query({
    query: query,
    variables: variables
  });
};

export const executeMutation = (
  mutation: DocumentNode,
  variables?: object,
  { loggedIn }: { loggedIn: boolean } = { loggedIn: true }
) => {
  return defaultClient(loggedIn).mutate({
    mutation: mutation,
    variables: variables
  });
};

export const client = {
  loggedIn: ({
    uuid,
    email,
    applicantUuid
    }: ICurrentUser) => LoggedInTestClient({ uuid, email, applicantUuid }),
  loggedOut: LoggedOutTestClient
};
