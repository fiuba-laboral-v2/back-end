import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { TestClientGenerator } from "$generators/TestClient";
import { CompanyUserGenerator } from "$generators/CompanyUser";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { CompanyUserRepository } from "$models/CompanyUser";

const GET_COMPANY_USERS = gql`
  query GetCompanyUsers($updatedBeforeThan: PaginatedInput) {
    getCompanyUsers(updatedBeforeThan: $updatedBeforeThan) {
      results {
        uuid
        companyUuid
        userUuid
      }
      shouldFetchMore
    }
  }
`;

describe("getCompanyUsers", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const performQuery = (apolloClient: TestClient, updatedBeforeThan?: IPaginatedInput) => {
    const variables = {
      updatedBeforeThan: {
        ...updatedBeforeThan,
        dateTime: updatedBeforeThan?.dateTime.toISOString()
      }
    };
    return apolloClient.query({
      query: GET_COMPANY_USERS,
      ...(updatedBeforeThan && { variables })
    });
  };

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: approvalStatus });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: approvalStatus });

  it("returns all companyUsers for the current company", async () => {
    const { apolloClient, company, user } = await createCompanyTestClient(ApprovalStatus.approved);
    const size = 5;
    const companyUsers = await CompanyUserGenerator.range({ company, size });
    const { data, errors } = await performQuery(apolloClient);

    expect(errors).toBeUndefined();
    const firstCompanyUser = await CompanyUserRepository.findByUserUuidIfExists(user.uuid!);
    const companyUserUuids = [firstCompanyUser!.uuid, ...companyUsers.map(({ uuid }) => uuid)];
    expect(data!.getCompanyUsers.results.map(({ uuid }) => uuid)).toEqual(companyUserUuids);
  });

  it("returns the next three companyUsers", async () => {
    const size = 6;
    const itemsPerPage = size / 2;
    mockItemsPerPage(itemsPerPage);
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const companyUsers = await CompanyUserGenerator.range({ company, size });
    const { data, errors } = await performQuery(apolloClient, {
      uuid: companyUsers[itemsPerPage - 1].uuid!,
      dateTime: companyUsers[itemsPerPage - 1].createdAt!
    });
    expect(errors).toBeUndefined();
    const { results, shouldFetchMore } = data!.getCompanyUsers;
    const companyUserUuids = companyUsers.map(({ uuid }) => uuid);

    expect(results).toHaveLength(itemsPerPage);
    expect(results.map(({ uuid }) => uuid)).toEqual(companyUserUuids.slice(itemsPerPage, size));
    expect(shouldFetchMore).toBe(false);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a approved applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.approved);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an extension admin", async () => {
    const secretary = Secretary.extension;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a graduados admin", async () => {
    const secretary = Secretary.graduados;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
