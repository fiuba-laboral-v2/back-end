import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { AuthConfig } from "$config/AuthConfig";
import { JWT } from "$src/JWT";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { Secretary } from "$models/Admin";
import { CurrentUserBuilder, CurrentUser } from "$models/CurrentUser";
import { User } from "$models";
import { BadCredentialsError } from "$graphql/User/Errors";
import { UserNotFoundError } from "$models/User/Errors";

import { UserGenerator } from "$generators/User";
import { ApplicantGenerator } from "$generators/Applicant";
import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";

const COMPANY_LOGIN = gql`
  mutation($email: String!, $password: String!) {
    companyLogin(email: $email, password: $password)
  }
`;

describe("login", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  const createExpressContext = () => ({ res: { cookie: jest.fn() } });

  const expectCookieToBeSet = async (expressContext: { res: { cookie: jest.Mock } }) => {
    expect(expressContext.res.cookie.mock.calls).toEqual([
      [AuthConfig.cookieName, expect.any(String), AuthConfig.cookieOptions]
    ]);
  };

  const testToken = async ({
    user,
    password,
    result
  }: {
    user: User;
    password: string;
    result: CurrentUser;
  }) => {
    const expressContext = createExpressContext();
    const apolloClient = client.loggedOut({ expressContext });
    const { errors } = await apolloClient.mutate({
      mutation: COMPANY_LOGIN,
      variables: {
        email: user.email,
        password
      }
    });
    expect(errors).toBeUndefined();
    await expectCookieToBeSet(expressContext);
    const token: string = expressContext.res.cookie.mock.calls[0][1];
    expect(JWT.decodeToken(token)).toBeObjectContaining(result);
  };

  it("sets the cookie for a user", async () => {
    const password = "AValidPassword0";
    const user = await UserGenerator.instance({ password });
    await testToken({
      user,
      password,
      result: CurrentUserBuilder.build({
        uuid: user.uuid,
        email: user.email
      })
    });
  });

  it("returns a token for a company user", async () => {
    const password = "AValidPassword2";
    const company = await CompanyGenerator.instance.withMinimumData({
      user: { password }
    });
    const [user] = await company.getUsers();
    await testToken({
      user,
      password,
      result: CurrentUserBuilder.build({
        uuid: user.uuid,
        email: user.email,
        company: {
          uuid: company.uuid
        }
      })
    });
  });

  it("returns an error if the user is an applicant", async () => {
    const password = "AValidPassword1";
    const applicant = await ApplicantGenerator.instance.withMinimumData();
    const user = await applicant.getUser();
    const { errors } = await client.loggedOut().mutate({
      mutation: COMPANY_LOGIN,
      variables: { email: user.email, password }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: Error.name });
  });

  it("returns an error if the user is an admin", async () => {
    const password = "AValidPassword3";
    const admin = await AdminGenerator.instance({ secretary: Secretary.extension });
    const user = await admin.getUser();
    const { errors } = await client.loggedOut().mutate({
      mutation: COMPANY_LOGIN,
      variables: { email: user.email, password }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: Error.name });
  });

  it("returns error if user is not registered", async () => {
    const { errors } = await client.loggedOut().mutate({
      mutation: COMPANY_LOGIN,
      variables: { email: "asd@asd.com", password: "AValidPassword000" }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: UserNotFoundError.name });
  });

  it("returns and error if the password does not match", async () => {
    const user = await UserGenerator.instance();
    const { errors } = await client.loggedOut().mutate({
      mutation: COMPANY_LOGIN,
      variables: { email: user.email, password: "WrongPassword" }
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: BadCredentialsError.name
    });
  });
});
