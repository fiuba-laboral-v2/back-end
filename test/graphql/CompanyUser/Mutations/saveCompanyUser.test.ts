import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ISaveCompanyUser } from "$graphql/CompanyUser/Mutations/saveCompanyUser";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";

import { IUserGeneratorAttributes } from "$generators/interfaces";
import { UserGenerator } from "$generators/User";
import { TestClientGenerator } from "$generators/TestClient";
import { omit } from "lodash";
import { UUID_REGEX } from "$test/models";
import { CompanyUserRepository } from "$models/CompanyUser";

const SAVE_COMPANY_USER = gql`
  mutation SaveCompanyUser($user: UserInput!) {
    saveCompanyUser(user: $user) {
      uuid
      companyUuid
      userUuid
      user {
        uuid
        email
        dni
        name
        surname
      }
    }
  }
`;

describe("saveCompanyUser", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const performQuery = (apolloClient: TestClient, variables: ISaveCompanyUser) =>
    apolloClient.query({ query: SAVE_COMPANY_USER, variables });

  const generateVariables = ({ email, password }: IUserGeneratorAttributes = {}) => ({
    user: UserGenerator.data.companyUser({ email, password })
  });

  it("adds a company user to current user's company", async () => {
    const { apolloClient, company } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
    const variables = generateVariables();
    const { errors, data } = await performQuery(apolloClient, variables);
    expect(errors).toBeUndefined();
    expect(data!.saveCompanyUser).toEqual({
      uuid: expect.stringMatching(UUID_REGEX),
      companyUuid: company.uuid,
      userUuid: expect.stringMatching(UUID_REGEX),
      user: {
        uuid: expect.stringMatching(UUID_REGEX),
        ...omit(variables.user, "password"),
        dni: null
      }
    });
  });

  it("returns an error if companyUser with the given email already exists", async () => {
    const { apolloClient, user } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
    const variables = generateVariables({ email: user.email });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("UserEmailAlreadyExistsError");
  });

  it("returns an error if the password does not have digits", async () => {
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
    const variables = generateVariables({ password: "PasswordWithNoDigits" });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithoutDigitsError");
  });

  it("returns an error if the password has less than ten digits", async () => {
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
    const variables = generateVariables({ password: "short" });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("ShortPasswordError");
  });

  it("returns an error if the password has more than a hundred digits", async () => {
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
    const variables = generateVariables({ password: "long".repeat(100) });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("LongPasswordError");
  });

  it("returns an error if the password does not have an upper case character", async () => {
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
    const variables = generateVariables({ password: "does_not_have_upper_case" });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithoutUppercaseError");
  });

  it("returns an error if the password does not have a lower case character", async () => {
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
    const variables = generateVariables({ password: "DOES_NOT_HAVE_LOWER_CASE" });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithoutLowercaseError");
  });

  it("returns an error if the password has spaces", async () => {
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
    const variables = generateVariables({ password: "password With Spaces 1" });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("PasswordWithSpacesError");
  });

  it("returns an error if the companyUser persistence fails", async () => {
    const { apolloClient, user, company } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
    jest.spyOn(CompanyUserRepository, "save").mockImplementation(() => {
      throw new Error();
    });
    const { errors } = await performQuery(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType("Error");
    const companyUsers = await CompanyUserRepository.findByCompanyUuid(company.uuid);
    const [companyUser] = companyUsers;

    expect(companyUsers).toHaveLength(1);
    expect(companyUser.userUuid).toEqual(user.uuid);
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
