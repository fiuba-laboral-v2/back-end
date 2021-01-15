import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { UUID } from "$models/UUID";

import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";
import { CompanyUserGenerator } from "$generators/CompanyUser";

const GET_COMPANY_USER_BY_UUID = gql`
  query GetCompanyUserByUuid($uuid: ID!) {
    getCompanyUserByUuid(uuid: $uuid) {
      uuid
      companyUuid
      position
      user {
        uuid
        name
        surname
        email
      }
    }
  }
`;

describe("getCompanyUserByUuid", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const performQuery = (apolloClient: TestClient, uuid: string) =>
    apolloClient.query({ query: GET_COMPANY_USER_BY_UUID, variables: { uuid } });

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: approvalStatus });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: approvalStatus });

  const expectToGetACompanyUser = async (status: ApprovalStatus) => {
    const { apolloClient, company } = await createCompanyTestClient(status);
    const companyUser = await CompanyUserGenerator.instance({ company });
    const { data, errors } = await performQuery(apolloClient, companyUser.uuid!);
    expect(errors).toBeUndefined();
    expect(data!.getCompanyUserByUuid.uuid).toEqual(companyUser.uuid!);
  };

  it("returns all companyUsers for the current user from an approved company", async () => {
    await expectToGetACompanyUser(ApprovalStatus.approved);
  });

  it("returns all companyUsers for the current user from a rejected company", async () => {
    await expectToGetACompanyUser(ApprovalStatus.rejected);
  });

  it("returns all companyUsers for the current user from a pending company", async () => {
    await expectToGetACompanyUser(ApprovalStatus.pending);
  });

  it("returns en error if the companyUser is from another company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.pending);
    const anotherCompany = await CompanyGenerator.instance.withMinimumData();
    const companyUser = await CompanyUserGenerator.instance({ company: anotherCompany });
    const { errors } = await performQuery(apolloClient, companyUser.uuid!);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is a approved applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.approved);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an extension admin", async () => {
    const secretary = Secretary.extension;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a graduados admin", async () => {
    const secretary = Secretary.graduados;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
