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

const LOGIN = gql`
  mutation($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

describe("login", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  const createExpressContext = () => ({ res: { cookie: jest.fn() } });

  const expectCookieToBeSet = async (
    user: User,
    expressContext: { res: { cookie: jest.Mock } }
  ) => {
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
      mutation: LOGIN,
      variables: {
        email: user.email,
        password
      }
    });
    expect(errors).toBeUndefined();
    await expectCookieToBeSet(user, expressContext);
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

  it("sets the cookie for an applicant user", async () => {
    const password = "AValidPassword1";
    const applicant = await ApplicantGenerator.instance.withMinimumData({
      password
    });
    const user = await applicant.getUser();
    await testToken({
      user,
      password,
      result: CurrentUserBuilder.build({
        uuid: user.uuid,
        email: user.email,
        applicant: {
          uuid: applicant.uuid
        }
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

  it("returns a token for an admin", async () => {
    const password = "AValidPassword3";
    const admin = await AdminGenerator.instance({ secretary: Secretary.extension, password });
    const user = await admin.getUser();
    await testToken({
      user,
      password,
      result: CurrentUserBuilder.build({
        uuid: user.uuid,
        email: user.email,
        admin: {
          userUuid: admin.userUuid
        }
      })
    });
  });

  it("returns error if user is not registered", async () => {
    const { errors } = await client.loggedOut().mutate({
      mutation: LOGIN,
      variables: {
        email: "asd@asd.com",
        password: "AValidPassword000"
      }
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UserNotFoundError.name
    });
  });

  it("returns and error if the password does not match", async () => {
    const email = "asd@asd.com";
    await UserRepository.create({
      email: email,
      password: "AValidPassword11",
      name: "name",
      surname: "surname"
    });
    const { errors } = await client.loggedOut().mutate({
      mutation: LOGIN,
      variables: {
        email: email,
        password: "AValidPassword22"
      }
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: BadCredentialsError.name
    });
  });
});
