import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import {
  CompanyUserNotFoundError,
  CompanyUserRepository,
  DeleteLastCompanyUserError
} from "$models/CompanyUser";
import { CareerRepository } from "$models/Career";
import { UUID } from "$models/UUID";

import { CompanyGenerator } from "$generators/Company";
import { CompanyUserGenerator } from "$generators/CompanyUser";
import { TestClientGenerator } from "$generators/TestClient";
import { Secretary } from "$models/Admin";

const DELETE_COMPANY_USER = gql`
  mutation DeleteCompanyUser($uuid: ID!) {
    deleteCompanyUser(uuid: $uuid)
  }
`;

describe("deleteCompanyUser", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const performMutation = (apolloClient: TestClient, uuid: string) =>
    apolloClient.mutate({ mutation: DELETE_COMPANY_USER, variables: { uuid } });

  it("deletes a companyUser from my company", async () => {
    const status = ApprovalStatus.approved;
    const { apolloClient, company } = await TestClientGenerator.company({ status });
    const companyUser = await CompanyUserGenerator.instance({ company });
    const { errors } = await performMutation(apolloClient, companyUser.uuid!);
    expect(errors).toBeUndefined();
    await expect(
      CompanyUserRepository.findByUuid(companyUser.uuid!)
    ).rejects.toThrowErrorWithMessage(
      CompanyUserNotFoundError,
      CompanyUserNotFoundError.buildMessage()
    );
  });

  it("returns an error if it's the last user from the company", async () => {
    const status = ApprovalStatus.approved;
    const { apolloClient, user } = await TestClientGenerator.company({ status });
    const companyUser = await CompanyUserRepository.findByUserUuid(user.uuid!);
    const { errors } = await performMutation(apolloClient, companyUser.uuid!);
    expect(errors).toEqualGraphQLErrorType(DeleteLastCompanyUserError.name);
  });

  it("returns an error if the user is from another company", async () => {
    const status = ApprovalStatus.approved;
    const { apolloClient, company } = await TestClientGenerator.company({ status });
    await CompanyUserGenerator.instance({ company });
    const anotherCompany = await CompanyGenerator.instance.withMinimumData();
    const companyUser = await CompanyUserGenerator.instance({ company: anotherCompany });
    const { errors } = await performMutation(apolloClient, companyUser.uuid!);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performMutation(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is an approved applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved
    });
    const { errors } = await performMutation(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.rejected
    });
    const { errors } = await performMutation(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.pending
    });
    const { errors } = await performMutation(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an extension admin", async () => {
    const secretary = Secretary.extension;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performMutation(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a graduados admin", async () => {
    const secretary = Secretary.graduados;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performMutation(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
