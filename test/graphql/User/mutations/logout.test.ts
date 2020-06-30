import { gql } from "apollo-server";
import { Database } from "../../../../src/config/Database";
import { client } from "../../ApolloTestClient";
import { UserRepository } from "../../../../src/models/User/Repository";
import { CompanyRepository } from "../../../../src/models/Company";
import { AuthenticationError } from "../../../../src/graphql/Errors";
import { testClientFactory } from "../../../mocks/testClientFactory";
import { AuthConfig } from "../../../../src/config/AuthConfig";

const LOGOUT = gql`
    mutation {
        logout
    }
`;

describe("logout", () => {
  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  afterAll(() => Database.close());

  const createExpressContext = () => ({
    res: { cookie: jest.fn() }
  });

  const expectCookieToBeRemoved = (expressContext: { res: { cookie: jest.Mock } }) =>
    expect(expressContext.res.cookie.mock.calls).toEqual([
      [AuthConfig.cookieName, "", AuthConfig.cookieOptions]
    ]);

  it("logouts an user setting empty cookie", async () => {
    const expressContext = createExpressContext();
    const { apolloClient } = await testClientFactory.user({ expressContext });
    const { errors } = await apolloClient.mutate({ mutation: LOGOUT });
    expect(errors).toBeUndefined();
    expectCookieToBeRemoved(expressContext);
  });

  it("logouts an applicant setting empty cookie", async () => {
    const expressContext = createExpressContext();
    const { apolloClient } = await testClientFactory.applicant({ expressContext });
    const { errors } = await apolloClient.mutate({ mutation: LOGOUT });
    expect(errors).toBeUndefined();
    expectCookieToBeRemoved(expressContext);
  });

  it("logouts a company user setting empty cookie", async () => {
    const expressContext = createExpressContext();
    const { apolloClient } = await testClientFactory.company({ expressContext });
    const { errors } = await apolloClient.mutate({ mutation: LOGOUT });
    expect(errors).toBeUndefined();
    expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if no logged user tries to log out", async () => {
    const { errors } = await client.loggedOut().mutate({ mutation: LOGOUT });
    expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
  });
});
