import { createTestClient } from "apollo-server-testing";
import { apolloErrorConverter } from "../../src/FormatErrors";
import { ICurrentUser } from "../../src/graphqlContext";
import { DocumentNode } from "graphql";
import { ApolloServer as Server } from "apollo-server-express";
import { schema } from "../../src/graphql/Schema";
import { CookieOptions } from "express";

export const testCurrentUserEmail = "test@test.test";
export const defaultUserUuid = "5bca6c9d-8367-4500-be05-0db55066b2a1";
export const defaultApplicantUuid = "f1866416-bbb7-4890-9c19-603ac02c3dec";

export const defaultCurrentUser = {
  uuid: defaultUserUuid,
  email: testCurrentUserEmail,
  applicantUuid: defaultApplicantUuid
};

const expressContextMock = () => ({
  res: { cookie: (name: string, val: string, options: CookieOptions) => ({}) }
});

const LoggedInTestClient = (currentUser: ICurrentUser = defaultCurrentUser) =>
  createTestClient(new Server({
    schema,
    formatError: apolloErrorConverter({ logger: false }),
    context: () => ({
      ...expressContextMock(),
      currentUser
    })
  }));

const LoggedOutTestClient = createTestClient(new Server({
  schema,
  formatError: apolloErrorConverter({ logger: false }),
  context: () => expressContextMock
}));

const defaultClient = (loggedIn: boolean) => loggedIn ? LoggedInTestClient({
  uuid: defaultUserUuid,
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
  loggedIn: (currentUser: ICurrentUser = defaultCurrentUser) => LoggedInTestClient(currentUser),
  loggedOut: LoggedOutTestClient
};
