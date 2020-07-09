import { gql } from "apollo-server";
import { ApolloServerTestClient } from "apollo-server-testing";
import { Database } from "../../../../src/config/Database";

import { CompanyRepository } from "../../../../src/models/Company";
import {
  AdminTask,
  AdminTaskType,
  IAdminTasksFilter
} from "../../../../src/models/AdminTask";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import { UserRepository } from "../../../../src/models/User";
import { Admin, Applicant, Company } from "../../../../src/models";
import { UnauthorizedError } from "../../../../src/graphql/Errors";

import { AdminGenerator } from "../../../generators/Admin";
import { CompanyGenerator } from "../../../generators/Company";
import { ApplicantGenerator } from "../../../generators/Applicant";
import { testClientFactory } from "../../../mocks/testClientFactory";

const GET_ADMIN_TASKS = gql`
  query GetAdminTasks(
      $adminTaskTypes: [AdminTaskType]!,
      $statuses: [ApprovalStatus]!
  ) {
      getAdminTasks(
          adminTaskTypes: $adminTaskTypes,
          statuses: $statuses
      ) {
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

describe("getAdminTasks", () => {
  let admin: Admin;
  let approvedCompany: Company;
  let rejectedCompany: Company;
  let pendingCompany: Company;
  let approvedApplicant: Applicant;
  let rejectedApplicant: Applicant;
  let pendingApplicant: Applicant;

  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    const companies = await CompanyGenerator.instance.updatedWithStatus();
    const applicants = await ApplicantGenerator.instance.updatedWithStatus();
    admin = await AdminGenerator.instance().next().value;

    rejectedCompany = await companies.next({ status: ApprovalStatus.rejected, admin }).value;
    approvedCompany = await companies.next({ status: ApprovalStatus.approved, admin }).value;
    pendingCompany = await companies.next().value;
    rejectedApplicant = await applicants.next({ status: ApprovalStatus.rejected, admin }).value;
    approvedApplicant = await applicants.next({ status: ApprovalStatus.approved, admin }).value;
    pendingApplicant = await applicants.next().value;
  });

  afterAll(() => Database.close());

  const getAdminTasks = async (filter: IAdminTasksFilter) => {
    const { apolloClient } = await testClientFactory.admin();
    const { errors, data } = await apolloClient.query({
      query: GET_ADMIN_TASKS,
      variables: filter
    });
    expect(errors).toBeUndefined();
    return data!.getAdminTasks;
  };

  const expectToFindApprovableWithStatuses = async (
    approvables: AdminTask[],
    statuses: ApprovalStatus[]
  ) => {
    const result = await getAdminTasks({
      adminTaskTypes: approvables.map(approvable => approvable.constructor.name) as any,
      statuses: statuses
    });
    expect(result).toEqual(expect.arrayContaining(
      approvables.map(approvable => expect.objectContaining({
        uuid: approvable.uuid
      }))
    ));
  };

  it("returns an empty array if no adminTaskTypes are provided", async () => {
    const result = await getAdminTasks({
      adminTaskTypes: [],
      statuses: [ApprovalStatus.pending]
    });
    expect(result).toEqual([]);
  });

  it("returns only pending companies", async () => {
    await expectToFindApprovableWithStatuses(
      [pendingCompany],
      [ApprovalStatus.pending]
    );
  });

  it("returns only approved companies", async () => {
    await expectToFindApprovableWithStatuses(
      [approvedCompany],
      [ApprovalStatus.approved]
    );
  });

  it("returns only rejected companies", async () => {
    await expectToFindApprovableWithStatuses(
      [rejectedCompany],
      [ApprovalStatus.rejected]
    );
  });

  it("returns only pending applicants", async () => {
    await expectToFindApprovableWithStatuses(
      [pendingApplicant],
      [ApprovalStatus.pending]
    );
  });

  it("returns only approved applicants", async () => {
    await expectToFindApprovableWithStatuses(
      [approvedApplicant],
      [ApprovalStatus.approved]
    );
  });

  it("returns only rejected applicants", async () => {
    await expectToFindApprovableWithStatuses(
      [rejectedApplicant],
      [ApprovalStatus.rejected]
    );
  });

  it("returns only pending applicants and companies", async () => {
    await expectToFindApprovableWithStatuses(
      [pendingApplicant, pendingCompany],
      [ApprovalStatus.pending]
    );
  });

  it("sorts all applicants and companies in any status by updated timestamp", async () => {
    const result = await getAdminTasks({
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected]
    });
    expect(result.map(approvable => approvable.uuid)).toEqual([
      pendingApplicant.uuid,
      approvedApplicant.uuid,
      rejectedApplicant.uuid,
      pendingCompany.uuid,
      approvedCompany.uuid,
      rejectedCompany.uuid
    ]);
    expect(result).toBeSortedBy({ key: "updatedAt", order: "desc" });
  });

  describe("when the variables are incorrect", () => {
    it("returns an error if no filter is provided", async () => {
      const { apolloClient } = await testClientFactory.admin();
      const { errors } = await apolloClient.query({
        query: GET_ADMIN_TASKS,
        variables: {}
      });
      expect(errors).not.toBeUndefined();
    });
  });

  describe("only admins can execute this query", () => {
    const testForbiddenAccess = async (
      { apolloClient }: { apolloClient: ApolloServerTestClient }
    ) => {
      const { errors } = await apolloClient.query({
        query: GET_ADMIN_TASKS,
        variables: {
          adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company],
          statuses: [ApprovalStatus.pending]
        }
      });
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
