import { gql } from "apollo-server";
import { ApolloServerTestClient } from "apollo-server-testing";
import { Database } from "../../../../src/config/Database";

import { CompanyRepository } from "../../../../src/models/Company";
import { ApplicantRepository } from "../../../../src/models/Applicant";
import { Approvable } from "../../../../src/models/Approvable";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import { UserRepository } from "../../../../src/models/User";
import { Admin } from "../../../../src/models/Admin";
import { GraphQLCompany } from "../../../../src/graphql/Company/Types/GraphQLCompany";
import { GraphQLApplicant } from "../../../../src/graphql/Applicant/Types/Applicant";
import { UnauthorizedError } from "../../../../src/graphql/Errors";

import { AdminGenerator } from "../../../generators/Admin";
import { CompanyGenerator, TCompanyGenerator } from "../../../generators/Company";
import { ApplicantGenerator, TApplicantGenerator } from "../../../generators/Applicant";
import { testClientFactory } from "../../../mocks/testClientFactory";

const GET_PENDING_ENTITIES = gql`
  query GetPendingEntities {
    getPendingEntities {
      ... on Company {
        __typename
        uuid
      }
      ... on Applicant {
        __typename
        uuid
      }
    }
  }
`;

describe("getPendingEntities", () => {
  let companies: TCompanyGenerator;
  let applicants: TApplicantGenerator;
  let admin: Admin;

  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    companies = CompanyGenerator.instance.withCompleteData();
    applicants = ApplicantGenerator.instance.withMinimumData();
    admin = await AdminGenerator.instance().next().value;
  });

  beforeEach(async () => {
    await CompanyRepository.truncate();
    await ApplicantRepository.truncate();
  });

  afterAll(() => Database.close());

  const getPendingEntities = async () => {
    const { apolloClient } = await testClientFactory.admin();
    const { data } = await apolloClient.query({ query: GET_PENDING_ENTITIES });
    return data!.getPendingEntities;
  };

  const updateCompanyWithStatus = async (status: ApprovalStatus) => {
    const { uuid: companyUuid } = await companies.next().value;
    return CompanyRepository.updateApprovalStatus(
      admin.userUuid,
      companyUuid,
      status
    );
  };

  const updateApplicantWithStatus = async (status: ApprovalStatus) => {
    const { uuid: applicantUuid } = await applicants.next().value;
    return ApplicantRepository.updateApprovalStatus(
      admin.userUuid,
      applicantUuid,
      status
    );
  };

  const expectEntityToEqualTypename = async (entity: Approvable, typename: string) => {
    const pendingEntities = await getPendingEntities();
    expect(pendingEntities).toEqual([{
      __typename: typename,
      uuid: entity.uuid
    }]);
  };

  it("returns company typename", async () => {
    const company = await companies.next().value;
    await expectEntityToEqualTypename(company, GraphQLCompany.name);
  });

  it("returns applicant typename", async () => {
    const applicant = await applicants.next().value;
    await expectEntityToEqualTypename(applicant, GraphQLApplicant.name);
  });

  it("returns only pending companies", async () => {
    await updateCompanyWithStatus(ApprovalStatus.rejected);
    await updateCompanyWithStatus(ApprovalStatus.approved);
    const pendingCompany = await companies.next().value;
    const result = await getPendingEntities();
    expect(result).toHaveLength(1);
    expect(result[0].uuid).toEqual(pendingCompany.uuid);
  });

  it("returns only pending applicants", async () => {
    await updateApplicantWithStatus(ApprovalStatus.rejected);
    await updateApplicantWithStatus(ApprovalStatus.approved);
    const pendingApplicant = await applicants.next().value;
    const result = await getPendingEntities();
    expect(result).toHaveLength(1);
    expect(result[0].uuid).toEqual(pendingApplicant.uuid);
  });

  it("returns only pending applicants and companies", async () => {
    await updateCompanyWithStatus(ApprovalStatus.rejected);
    await updateCompanyWithStatus(ApprovalStatus.approved);
    await updateApplicantWithStatus(ApprovalStatus.rejected);
    await updateApplicantWithStatus(ApprovalStatus.approved);
    const pendingApplicant = await applicants.next().value;
    const pendingCompany = await companies.next().value;
    const result = await getPendingEntities();
    expect(result).toHaveLength(2);
    expect(result.map(entity => entity.uuid)).toEqual(expect.arrayContaining([
      pendingApplicant.uuid,
      pendingCompany.uuid
    ]));
  });

  it("sorts pending companies by updated timestamp", async () => {
    const firstCompany = await companies.next().value;
    const secondCompany = await companies.next().value;
    expect([secondCompany, firstCompany]).toBeSortedBy({ key: "updatedAt", descending: true });
    const [firstResult, secondResult] = await getPendingEntities();
    expect(firstResult.uuid).toEqual(secondCompany.uuid);
    expect(secondResult.uuid).toEqual(firstCompany.uuid);
  });

  it("sorts pending applicants by updated timestamp", async () => {
    const firstApplicant = await applicants.next().value;
    const secondApplicant = await applicants.next().value;
    expect([secondApplicant, firstApplicant]).toBeSortedBy({ key: "updatedAt", descending: true });
    const [firstResult, secondResult] = await getPendingEntities();
    expect(firstResult.uuid).toEqual(secondApplicant.uuid);
    expect(secondResult.uuid).toEqual(firstApplicant.uuid);
  });

  it("sorts pending applicants and companies by updated timestamp", async () => {
    const applicant1 = await applicants.next().value;
    const applicant2 = await applicants.next().value;
    const company3 = await companies.next().value;
    const company4 = await companies.next().value;
    const entitiesOrderByLatestUpdated = [company4, company3, applicant2, applicant1];
    expect(entitiesOrderByLatestUpdated).toBeSortedBy({ key: "updatedAt", descending: true });
    const [firstResult, secondResult, thirdResult, fourthResult] = await getPendingEntities();
    expect(firstResult.uuid).toEqual(company4.uuid);
    expect(secondResult.uuid).toEqual(company3.uuid);
    expect(thirdResult.uuid).toEqual(applicant2.uuid);
    expect(fourthResult.uuid).toEqual(applicant1.uuid);
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
