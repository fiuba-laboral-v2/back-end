import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { IGetUsersByCompany } from "$graphql/Admin/Queries/getCompanyUsersByCompany";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { CompanyUserRepository } from "$models/CompanyUser";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

import { CompanyGenerator } from "$generators/Company";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";
import { TestClientGenerator } from "$generators/TestClient";
import { CompanyUserGenerator } from "$generators/CompanyUser";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

const GET_COMPANY_USERS_BY_COMPANY = gql`
  query getCompanyUsersByCompany($companyUuid: ID!, $updatedBeforeThan: PaginatedInput) {
    getCompanyUsersByCompany(companyUuid: $companyUuid, updatedBeforeThan: $updatedBeforeThan) {
      results {
        uuid
        companyUuid
        userUuid
      }
      shouldFetchMore
    }
  }
`;

describe("getCompanyUsersByCompany", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await SecretarySettingsRepository.truncate();

    await SecretarySettingsGenerator.createDefaultSettings();
  });

  const performQuery = (
    apolloClient: TestClient,
    { updatedBeforeThan, companyUuid }: IGetUsersByCompany
  ) => {
    if (updatedBeforeThan) {
      return apolloClient.query({
        query: GET_COMPANY_USERS_BY_COMPANY,
        variables: {
          companyUuid,
          updatedBeforeThan: {
            ...updatedBeforeThan,
            dateTime: updatedBeforeThan?.dateTime.toISOString()
          }
        }
      });
    }
    return apolloClient.query({ query: GET_COMPANY_USERS_BY_COMPANY, variables: { companyUuid } });
  };

  it("returns all companyUsers for the given company", async () => {
    const secretary = Secretary.extension;
    const { company, user } = await TestClientGenerator.company();
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const size = 5;
    const companyUsers = await CompanyUserGenerator.range({ company, size });
    const { data, errors } = await performQuery(apolloClient, { companyUuid: company.uuid });

    expect(errors).toBeUndefined();
    const firstCompanyUser = await CompanyUserRepository.findByUserUuid(user.uuid!);
    const companyUserUuids = [firstCompanyUser!.uuid, ...companyUsers.map(({ uuid }) => uuid)];
    expect(data!.getCompanyUsersByCompany.results.map(({ uuid }) => uuid)).toEqual(
      companyUserUuids
    );
  });

  it("returns the next three companyUsers", async () => {
    const { company } = await TestClientGenerator.company();
    const secretary = Secretary.extension;
    const size = 6;
    const itemsPerPage = size / 2;
    mockItemsPerPage(itemsPerPage);
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const companyUsers = await CompanyUserGenerator.range({ company, size });
    const { data, errors } = await performQuery(apolloClient, {
      companyUuid: company.uuid,
      updatedBeforeThan: {
        uuid: companyUsers[itemsPerPage - 1].uuid!,
        dateTime: companyUsers[itemsPerPage - 1].createdAt!
      }
    });
    expect(errors).toBeUndefined();
    const { results, shouldFetchMore } = data!.getCompanyUsersByCompany;
    const companyUserUuids = companyUsers.map(({ uuid }) => uuid);

    expect(results).toHaveLength(itemsPerPage);
    expect(results.map(({ uuid }) => uuid)).toEqual(companyUserUuids.slice(itemsPerPage, size));
    expect(shouldFetchMore).toBe(false);
  });

  it("returns an error if there is no current user", async () => {
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, { companyUuid });
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is from an approved company", async () => {
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.approved });
    const { errors } = await performQuery(apolloClient, { companyUuid });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.rejected });
    const { errors } = await performQuery(apolloClient, { companyUuid });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.pending });
    const { errors } = await performQuery(apolloClient, { companyUuid });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a approved applicant", async () => {
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved
    });
    const { errors } = await performQuery(apolloClient, { companyUuid });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.rejected
    });
    const { errors } = await performQuery(apolloClient, { companyUuid });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.pending
    });
    const { errors } = await performQuery(apolloClient, { companyUuid });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
