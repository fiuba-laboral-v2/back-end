import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { IUpdatePassword } from "$graphql/CompanyUser/Mutations/updatePassword";

import { BadCredentialsError, UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";

import { TestClientGenerator } from "$generators/TestClient";

const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($oldPassword: String!, $newPassword: String!) {
    updatePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
      uuid
      userUuid
    }
  }
`;

describe("updatePassword", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const performQuery = (apolloClient: TestClient, variables: IUpdatePassword) =>
    apolloClient.mutate({ mutation: UPDATE_PASSWORD, variables });

  const generateVariables = (variables?: Partial<IUpdatePassword>) => ({
    oldPassword: variables?.oldPassword || "SecurePassword1010",
    newPassword: variables?.newPassword || "AValidPassword000"
  });

  it("updates the companyUser password", async () => {
    const variables = generateVariables();
    const { apolloClient, user } = await TestClientGenerator.company({
      status: ApprovalStatus.approved,
      user: { password: variables.oldPassword }
    });
    const { errors, data } = await performQuery(apolloClient, variables);
    expect(errors).toBeUndefined();
    expect(data!.updatePassword.userUuid).toEqual(user.uuid);
  });

  it("returns an error if the old password does not match", async () => {
    const variables = generateVariables();
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved,
      user: { password: "MySecurePassword002200" }
    });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType(BadCredentialsError.name);
  });

  it("returns an error if the password does not have digits", async () => {
    const variables = generateVariables({ newPassword: "PasswordWithNoDigits" });
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved,
      user: { password: variables.oldPassword }
    });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithoutDigitsError");
  });

  it("returns an error if the password has less than ten digits", async () => {
    const variables = generateVariables({ newPassword: "ShortPasswordError" });
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved,
      user: { password: variables.oldPassword }
    });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithoutDigitsError");
  });

  it("returns an error if the password has more than a hundred digits", async () => {
    const variables = generateVariables({ newPassword: "long".repeat(100) });
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved,
      user: { password: variables.oldPassword }
    });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("LongPasswordError");
  });

  it("returns an error if the password does not have an upper case character", async () => {
    const variables = generateVariables({ newPassword: "does_not_have_upper_case" });
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved,
      user: { password: variables.oldPassword }
    });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithoutUppercaseError");
  });

  it("returns an error if the password does not have a lower case character", async () => {
    const variables = generateVariables({ newPassword: "DOES_NOT_HAVE_LOWER_CASE" });
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved,
      user: { password: variables.oldPassword }
    });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithoutLowercaseError");
  });

  it("returns an error if the password has spaces", async () => {
    const variables = generateVariables({ newPassword: "password With Spaces 1" });
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved,
      user: { password: variables.oldPassword }
    });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithSpacesError");
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.pending });
    const { errors } = await performQuery(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.rejected });
    const { errors } = await performQuery(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an approved applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved
    });
    const { errors } = await performQuery(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.rejected
    });
    const { errors } = await performQuery(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.pending
    });
    const { errors } = await performQuery(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
