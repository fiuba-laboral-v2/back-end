import { gql } from "apollo-server";
import Database from "../../../../src/config/Database";
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

  it("logouts with no errors", async () => {
    const setCookie = jest.fn();
    const expressContext = {
      res: { cookie: setCookie }
    };
    const { apolloClient } = await testClientFactory.applicant({ expressContext });
    const { errors } = await apolloClient.mutate({ mutation: LOGOUT });
    expect(errors).toBeUndefined();
    expect(setCookie.mock.calls).toEqual([
      [AuthConfig.cookieName, "", AuthConfig.cookieOptions]
    ]);
  });

  it("returns an error if no logged user tries to log out", async () => {
    const { errors } = await client.loggedOut().mutate({ mutation: LOGOUT });
    expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
  });
});
