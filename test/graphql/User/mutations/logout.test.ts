import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { AuthenticationError } from "$graphql/Errors";
import { TestClientGenerator } from "$generators/TestClient";
import { userTokenAssertions } from "../userTokenAssertions";

const LOGOUT = gql`
  mutation {
    logout
  }
`;

describe("logout", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  it("logouts an user setting empty cookie", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient } = await TestClientGenerator.user({ expressContext });
    const { errors } = await apolloClient.mutate({ mutation: LOGOUT });
    expect(errors).toBeUndefined();
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("logouts an applicant setting empty cookie", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient } = await TestClientGenerator.applicant({
      expressContext
    });
    const { errors } = await apolloClient.mutate({ mutation: LOGOUT });
    expect(errors).toBeUndefined();
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("logouts a company user setting empty cookie", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient } = await TestClientGenerator.company({
      expressContext
    });
    const { errors } = await apolloClient.mutate({ mutation: LOGOUT });
    expect(errors).toBeUndefined();
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if no logged user tries to log out", async () => {
    const { errors } = await client.loggedOut().mutate({ mutation: LOGOUT });
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });
});
