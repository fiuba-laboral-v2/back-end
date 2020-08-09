import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { AuthenticationError } from "$graphql/Errors";
import { TestClientGenerator } from "$generators/TestClient";
import { AuthConfig } from "$config/AuthConfig";

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

  const createExpressContext = () => ({
    res: { cookie: jest.fn() }
  });

  const expectCookieToBeRemoved = (expressContext: { res: { cookie: jest.Mock } }) =>
    expect(expressContext.res.cookie.mock.calls).toEqual([
      [AuthConfig.cookieName, "", AuthConfig.cookieOptions]
    ]);

  it("logouts an user setting empty cookie", async () => {
    const expressContext = createExpressContext();
    const { apolloClient } = await TestClientGenerator.user({ expressContext });
    const { errors } = await apolloClient.mutate({ mutation: LOGOUT });
    expect(errors).toBeUndefined();
    expectCookieToBeRemoved(expressContext);
  });

  it("logouts an applicant setting empty cookie", async () => {
    const expressContext = createExpressContext();
    const { apolloClient } = await TestClientGenerator.applicant({ expressContext });
    const { errors } = await apolloClient.mutate({ mutation: LOGOUT });
    expect(errors).toBeUndefined();
    expectCookieToBeRemoved(expressContext);
  });

  it("logouts a company user setting empty cookie", async () => {
    const expressContext = createExpressContext();
    const { apolloClient } = await TestClientGenerator.company({ expressContext });
    const { errors } = await apolloClient.mutate({ mutation: LOGOUT });
    expect(errors).toBeUndefined();
    expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if no logged user tries to log out", async () => {
    const { errors } = await client.loggedOut().mutate({ mutation: LOGOUT });
    expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
  });
});
