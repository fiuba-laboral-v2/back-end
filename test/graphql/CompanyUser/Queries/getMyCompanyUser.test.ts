import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { TestClientGenerator } from "$generators/TestClient";
import { CompanyUserGenerator } from "$generators/CompanyUser";
import { CompanyUserRepository } from "$models/CompanyUser";

const GET_MY_COMPANY_USER = gql`
  query GetMyCompanyUser {
    getMyCompanyUser {
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

describe("getMyCompanyUser", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const performQuery = (apolloClient: TestClient) =>
    apolloClient.query({ query: GET_MY_COMPANY_USER });

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: approvalStatus });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: approvalStatus });

  const expectToGetMyCompanyUser = async (status: ApprovalStatus) => {
    const { apolloClient, company, user } = await createCompanyTestClient(status);
    await CompanyUserGenerator.instance({ company });
    const { data, errors } = await performQuery(apolloClient);

    expect(errors).toBeUndefined();
    const myCompanyUser = await CompanyUserRepository.findByUserUuid(user.uuid!);
    expect(data!.getMyCompanyUser).toEqual({
      uuid: myCompanyUser.uuid,
      companyUuid: company.uuid,
      position: myCompanyUser.position,
      user: {
        uuid: user.uuid,
        name: user.name,
        surname: user.surname,
        email: user.email
      }
    });
  };

  it("returns all companyUsers for the current user from an approved company", async () => {
    await expectToGetMyCompanyUser(ApprovalStatus.approved);
  });

  it("returns all companyUsers for the current user from a rejected company", async () => {
    await expectToGetMyCompanyUser(ApprovalStatus.rejected);
  });

  it("returns all companyUsers for the current user from a pending company", async () => {
    await expectToGetMyCompanyUser(ApprovalStatus.pending);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
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
