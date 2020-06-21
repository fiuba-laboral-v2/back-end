import { CompanyRepository } from "../../../../src/models/Company";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import Database from "../../../../src/config/Database";
import { AdminGenerator } from "../../../generators/Admin";
import { CompanyGenerator, TCompanyDataGenerator } from "../../../generators/Company";
import { UserRepository } from "../../../../src/models/User";
import { Admin } from "../../../../src/models/Admin";
import { gql } from "apollo-server";
import { testClientFactory } from "../../../mocks/testClientFactory";
import { GraphQLCompany } from "../../../../src/graphql/Company/Types/GraphQLCompany";

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
    await CompanyRepository.create(companiesData.next().value);
    const { apolloClient } = await testClientFactory.user();
    const { data } = await apolloClient.query({ query: GET_PENDING_ENTITIES });
    expect(data!.getPendingEntities[0].__typename).toEqual(GraphQLCompany.name);
  });

  it("returns only pending companies", async () => {
    const rejectedCompany = await CompanyRepository.create(companiesData.next().value);
    await CompanyRepository.updateApprovalStatus(
      admin,
      rejectedCompany,
      ApprovalStatus.rejected
    );

    const approvedCompany = await CompanyRepository.create(companiesData.next().value);
    await CompanyRepository.updateApprovalStatus(
      admin,
      approvedCompany,
      ApprovalStatus.approved
    );

    const pendingCompany = await CompanyRepository.create(companiesData.next().value);

    const { apolloClient } = await testClientFactory.user();
    const { data } = await apolloClient.query({ query: GET_PENDING_ENTITIES });

    const result = data!.getPendingEntities;
    expect(result.length).toEqual(1);
    expect(result[0].uuid).toEqual(pendingCompany.uuid);
  });

  it("sorts pending companies by updated timestamp", async () => {
    const firstCompany = await CompanyRepository.create(companiesData.next().value);
    const secondCompany = await CompanyRepository.create(companiesData.next().value);

    expect(firstCompany.updatedAt < secondCompany.updatedAt).toBe(true);

    const { apolloClient } = await testClientFactory.user();
    const { data } = await apolloClient.query({ query: GET_PENDING_ENTITIES });

    const [firstResult, secondResult] = data!.getPendingEntities;
    expect(firstResult.uuid).toEqual(secondCompany.uuid);
    expect(secondResult.uuid).toEqual(firstCompany.uuid);
  });
});
