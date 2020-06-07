import { gql } from "apollo-server";
import { executeMutation, client } from "../../ApolloTestClient";
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

  const createExpressContext = () => ({
    res: { cookie: jest.fn() }
  });

  const expectCookieToBeSet = async (
    user: User,
    expressContext: { res: { cookie: jest.Mock } }
  ) => {
    expect(expressContext.res.cookie.mock.calls).toEqual([
      [
        AuthConfig.cookieName,
        await JWT.createToken(user),
        AuthConfig.cookieOptions
      ]
    ]);
  };

  it("sets the cookie for a user", async () => {
    const password = "AValidPassword3";
    const expressContext = createExpressContext();
    const user = await userFactory.user({ password });
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
  });

  it("sets the cookie for an applicant user", async () => {
    const expressContext = createExpressContext();
    const password = "AValidPassword3";
    const applicant = await userFactory.applicant({ password });
    const user = await applicant.getUser();
    const apolloClient = client.loggedOut({ expressContext });
    const { errors } = await apolloClient.mutate({
      mutation: LOGIN,
      variables: { email: user.email, password }
    });
    expect(errors).toBeUndefined();
    await expectCookieToBeSet(user, expressContext);
  });

  it("returns a token for an company user", async () => {
    const expressContext = createExpressContext();
    const password = "AValidPassword3";
    const company = await userFactory.company(password);
    const [user] = await company.getUsers();
    const apolloClient = client.loggedOut({ expressContext });
    const { errors } = await apolloClient.mutate({
      mutation: LOGIN,
      variables: { email: user.email, password }
    });
    expect(errors).toBeUndefined();
    await expectCookieToBeSet(user, expressContext);
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
      password: "AValidPassword1",
      name: "name",
      surname: "surname"
    });
    const { errors } = await executeMutation(LOGIN, {
      email: email,
      password: "AValidPassword2"
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: BadCredentialsError.name });
  });
});
