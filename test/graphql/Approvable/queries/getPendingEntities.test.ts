import { CompanyRepository } from "../../../../src/models/Company";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import { Database } from "../../../../src/config/Database";
import { AdminGenerator } from "../../../generators/Admin";
import { CompanyGenerator, TCompanyDataGenerator } from "../../../generators/Company";
import { UserRepository } from "../../../../src/models/User";
import { Admin } from "../../../../src/models/Admin";
import { gql } from "apollo-server";
import { testClientFactory } from "../../../mocks/testClientFactory";
import { GraphQLCompany } from "../../../../src/graphql/Company/Types/GraphQLCompany";
import { UnauthorizedError } from "../../../../src/graphql/Errors";
import { ApolloServerTestClient } from "apollo-server-testing";

const GET_PENDING_ENTITIES = gql`
  query GetPendingEntities {
    getPendingEntities {
      ... on Company {
        __typename
        uuid
      }
    }
  }
`;

describe("getPendingEntities", () => {
  let companiesData: TCompanyDataGenerator;
  let admin: Admin;

  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    companiesData = await CompanyGenerator.data.completeData();
    admin = await AdminGenerator.instance().next().value;
  });

  beforeEach(async () => {
    await CompanyRepository.truncate();
  });

  afterAll(() => Database.close());

  it("returns company typename", async () => {
    const company = await CompanyRepository.create(companiesData.next().value);
    const { apolloClient } = await testClientFactory.admin();
    const { data } = await apolloClient.query({ query: GET_PENDING_ENTITIES });
    expect(data!.getPendingEntities).toEqual([{
      __typename: GraphQLCompany.name,
      uuid: company.uuid
    }]);
  });

  it("returns only pending companies", async () => {
    const rejectedCompany = await CompanyRepository.create(companiesData.next().value);
    await CompanyRepository.updateApprovalStatus(
      admin.userUuid,
      rejectedCompany.uuid,
      ApprovalStatus.rejected
    );

    const approvedCompany = await CompanyRepository.create(companiesData.next().value);
    await CompanyRepository.updateApprovalStatus(
      admin.userUuid,
      approvedCompany.uuid,
      ApprovalStatus.approved
    );

    const pendingCompany = await CompanyRepository.create(companiesData.next().value);

    const { apolloClient } = await testClientFactory.admin();
    const { data } = await apolloClient.query({ query: GET_PENDING_ENTITIES });

    const result = data!.getPendingEntities;
    expect(result.length).toEqual(1);
    expect(result[0].uuid).toEqual(pendingCompany.uuid);
  });

  it("sorts pending companies by updated timestamp", async () => {
    const firstCompany = await CompanyRepository.create(companiesData.next().value);
    const secondCompany = await CompanyRepository.create(companiesData.next().value);

    expect(firstCompany.updatedAt < secondCompany.updatedAt).toBe(true);

    const { apolloClient } = await testClientFactory.admin();
    const { data } = await apolloClient.query({ query: GET_PENDING_ENTITIES });

    const [firstResult, secondResult] = data!.getPendingEntities;
    expect(firstResult.uuid).toEqual(secondCompany.uuid);
    expect(secondResult.uuid).toEqual(firstCompany.uuid);
  });

  describe("only admins can execute this query", () => {
    const testForbiddenAccess = async (
      { apolloClient }: { apolloClient: ApolloServerTestClient }
    ) => {
      const { errors } = await apolloClient.query({ query: GET_PENDING_ENTITIES });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    };

    it("throws an error to plain users", async () => {
      await testForbiddenAccess(await testClientFactory.user());
    });

    it("throws an error to company users", async () => {
      await testForbiddenAccess(await testClientFactory.company());
    });

    it("throws an error to applicants", async () => {
      await testForbiddenAccess(await testClientFactory.applicant());
    });
  });
});
