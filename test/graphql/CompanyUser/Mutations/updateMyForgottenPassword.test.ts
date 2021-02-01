import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { IUpdateMyForgottenPassword } from "$graphql/CompanyUser/Mutations/updateMyForgottenPassword";

import { Secretary } from "$models/Admin";
import { JWTConfig } from "$config";
import { JWT } from "$src/JWT";
import { User, UserRepository } from "$models/User";
import { FiubaCredentials } from "$models/User/Credentials";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";

import { TestClientGenerator } from "$generators/TestClient";
import { CompanyUserNotFoundError } from "$models/CompanyUser";
import { userTokenAssertions } from "$test/graphql/User/userTokenAssertions";

const UPDATE_MY_FORGOTTEN_PASSWORD = gql`
  mutation UpdateMyForgottenPassword($token: String!, $newPassword: String!) {
    updateMyForgottenPassword(token: $token, newPassword: $newPassword)
  }
`;

interface IGenerateVariables {
  newPassword?: string;
  user: User;
}

describe("updateMyForgottenPassword", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const performQuery = (apolloClient: TestClient, variables: IUpdateMyForgottenPassword) =>
    apolloClient.mutate({ mutation: UPDATE_MY_FORGOTTEN_PASSWORD, variables });

  const generateVariables = async ({ user, newPassword }: IGenerateVariables) => {
    const token = await JWT.createToken(user, "recoverPassword");
    return {
      token: token,
      newPassword: newPassword || "AValidPassword000"
    };
  };

  it("updates the companyUser password", async () => {
    const { user } = await TestClientGenerator.company();
    const variables = await generateVariables({ user });
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toBeUndefined();
    const persistedUser = await UserRepository.findByUuid(user.uuid!);
    await expect(
      persistedUser.credentials.authenticate(variables.newPassword)
    ).resolves.not.toThrowError();
  });

  it("returns an error if the password does not have digits", async () => {
    const { user } = await TestClientGenerator.company();
    const variables = await generateVariables({ user, newPassword: "PasswordWithNoDigits" });
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithoutDigitsError");
  });

  it("returns an error if the password has less than ten digits", async () => {
    const { user } = await TestClientGenerator.company();
    const variables = await generateVariables({ user, newPassword: "ShortPasswordError" });
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithoutDigitsError");
  });

  it("returns an error if the password has more than a hundred digits", async () => {
    const { user } = await TestClientGenerator.company();
    const variables = await generateVariables({ user, newPassword: "long".repeat(100) });
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("LongPasswordError");
  });

  it("returns an error if the password does not have an upper case character", async () => {
    const { user } = await TestClientGenerator.company();
    const variables = await generateVariables({ user, newPassword: "does_not_have_upper_case" });
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithoutUppercaseError");
  });

  it("returns an error if the password does not have a lower case character", async () => {
    const { user } = await TestClientGenerator.company();
    const variables = await generateVariables({ user, newPassword: "DOES_NOT_HAVE_LOWER_CASE" });
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithoutLowercaseError");
  });

  it("returns an error if the password has spaces", async () => {
    const { user } = await TestClientGenerator.company();
    const variables = await generateVariables({ user, newPassword: "password With Spaces 1" });
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithSpacesError");
  });

  it("returns an error if the token expires", async () => {
    jest.spyOn(JWTConfig, "expirationTime").mockImplementation(() => "0d");
    const { user } = await TestClientGenerator.company();
    const apolloClient = client.loggedOut();
    const variables = await generateVariables({ user });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the token has an encoded applicant user", async () => {
    const password = "SecurePass100";
    const { user } = await TestClientGenerator.applicant({ password });
    const apolloClient = client.loggedOut();
    const variables = await generateVariables({ user });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType(CompanyUserNotFoundError.name);
    const persistedUser = await UserRepository.findByUuid(user.uuid!);
    expect(persistedUser.credentials).toBeInstanceOf(FiubaCredentials);
  });

  it("returns an error if the token has an encoded admin user", async () => {
    const password = "SecurePass100";
    const { user } = await TestClientGenerator.admin({ secretary: Secretary.extension, password });
    const apolloClient = client.loggedOut();
    const variables = await generateVariables({ user });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType(CompanyUserNotFoundError.name);
    const persistedUser = await UserRepository.findByUuid(user.uuid!);
    expect(persistedUser.credentials).toBeInstanceOf(FiubaCredentials);
  });

  it("returns an error if an approved company user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.company({
      status: ApprovalStatus.approved,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, await generateVariables({ user }));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if a pending company user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.company({
      status: ApprovalStatus.pending,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, await generateVariables({ user }));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if a rejected company user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.company({
      status: ApprovalStatus.rejected,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, await generateVariables({ user }));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if an approved applicant user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, await generateVariables({ user }));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if a rejected applicant user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.applicant({
      status: ApprovalStatus.rejected,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, await generateVariables({ user }));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if a pending applicant user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.applicant({
      status: ApprovalStatus.pending,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, await generateVariables({ user }));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if an extension admin user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.admin({
      secretary: Secretary.extension,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, await generateVariables({ user }));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if a graduados admin user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.admin({
      secretary: Secretary.graduados,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, await generateVariables({ user }));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });
});
