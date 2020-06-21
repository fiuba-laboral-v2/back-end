import { gql } from "apollo-server";
import { client, executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { User, UserRepository } from "../../../../src/models/User";
import { CompanyRepository } from "../../../../src/models/Company";
import { userFactory } from "../../../mocks/user";
import { JWT } from "../../../../src/JWT";
import { BadCredentialsError } from "../../../../src/graphql/User/Errors";
import { UserNotFoundError } from "../../../../src/models/User/Errors";
import { AuthConfig } from "../../../../src/config/AuthConfig";

const LOGIN = gql`
  mutation ($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

describe("login", () => {
  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  afterAll(() => Database.close());

  const createExpressContext = () => ({ res: { cookie: jest.fn() } });

  const expectCookieToBeSet = async (
    user: User,
    expressContext: { res: { cookie: jest.Mock } }
  ) => {
    expect(expressContext.res.cookie.mock.calls).toEqual([
      [
        AuthConfig.cookieName,
        expect.any(String),
        AuthConfig.cookieOptions
      ]
    ]);
  };

  const testToken = async (
    { user, password, result }: { user: User, password: string, result: object }
  ) => {
    const expressContext = createExpressContext();
    const apolloClient = client.loggedOut({ expressContext });
    const { errors } = await apolloClient.mutate({
      mutation: LOGIN,
      variables: {
        email: user.email,
        password
      }
    });
    expect(errors).toBeUndefined();
    await expectCookieToBeSet(user, expressContext);
    const token: string = expressContext.res.cookie.mock.calls[0][1];
    expect(JWT.decodeToken(token)).toEqual(expect.objectContaining(result));
  };

  it("sets the cookie for a user", async () => {
    const password = "AValidPassword0";
    const user = await userFactory.user({ password });
    await testToken({
      user,
      password,
      result: {
        uuid: user.uuid,
        email: user.email
      }
    });
  });

  it("sets the cookie for an applicant user", async () => {
    const password = "AValidPassword1";
    const applicant = await userFactory.applicant({ password });
    const user = await applicant.getUser();
    await testToken({
      user,
      password,
      result: {
        uuid: user.uuid,
        email: user.email,
        applicant: {
          uuid: applicant.uuid
        }
      }
    });
  });

  it("returns a token for a company user", async () => {
    const password = "AValidPassword2";
    const company = await userFactory.company({ user: { password } });
    const [user] = await company.getUsers();
    await testToken({
      user,
      password,
      result: {
        uuid: user.uuid,
        email: user.email,
        company: {
          uuid: company.uuid
        }
      }
    });
  });

  it("returns a token for an admin", async () => {
    const password = "AValidPassword3";
    const admin = await userFactory.admin({ password });
    const user = await admin.getUser();
    await testToken({
      user,
      password,
      result: {
        uuid: user.uuid,
        email: user.email,
        admin: {
          userUuid: admin.userUuid
        }
      }
    });
  });

  it("returns error if user is not registered", async () => {
    const { errors } = await executeMutation(LOGIN, {
      email: "asd@asd.com",
      password: "AValidPassword000"
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: UserNotFoundError.name });
  });

  it("returns and error if the password does not match", async () => {
    const email = "asd@asd.com";
    await UserRepository.create({
      email: email,
      password: "AValidPassword11",
      name: "name",
      surname: "surname"
    });
    const { errors } = await executeMutation(LOGIN, {
      email: email,
      password: "AValidPassword22"
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: BadCredentialsError.name });
  });
});
