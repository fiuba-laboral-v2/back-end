import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing";
import Database from "../../../../src/config/Database";
import { client } from "../../../graphql/ApolloTestClient";

import { testClientFactory } from "../../../mocks/testClientFactory";
import { CompanyGenerator } from "../../../generators/Company";

import { Company, CompanyRepository } from "../../../../src/models/Company";
import {
  CompanyApprovalEventRepository
} from "../../../../src/models/Company/CompanyApprovalEvent";
import { UserRepository } from "../../../../src/models/User";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";
import { CompanyNotUpdatedError } from "../../../../src/models/Company/Errors";

const UPDATE_COMPANY_APPROVAL_STATUS = gql`
    mutation (
        $uuid: ID!,
        $approvalStatus: ApprovalStatus!
       ) {
        updateCompanyApprovalStatus(
            uuid: $uuid,
            approvalStatus: $approvalStatus
        ) {
            uuid
            approvalStatus
        }
    }
`;

describe("updateCompanyApprovalStatus", () => {
  let company: Company;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    company = await CompanyGenerator.instance.withMinimumData().next().value;
  });

  beforeEach(() => CompanyApprovalEventRepository.truncate());

  afterAll(() => Database.close());

  const performMutation = (apolloClient: TestClient, dataToUpdate: object) =>
    apolloClient.mutate({
      mutation: UPDATE_COMPANY_APPROVAL_STATUS,
      variables: dataToUpdate
    });

  const expectToUpdateStatusAndLogEvent = async (newStatus: ApprovalStatus) => {
    const { admin, apolloClient } = await testClientFactory.admin();
    const dataToUpdate = { uuid: company.uuid, approvalStatus: newStatus };
    const { data, errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).toBeUndefined();
    expect(data!.updateCompanyApprovalStatus).toEqual({
      uuid: company.uuid,
      approvalStatus: newStatus
    });
    expect(await CompanyApprovalEventRepository.findAll()).toEqual(
      expect.arrayContaining([
        expect.objectContaining(
          {
            userUuid: admin.userUuid,
            companyUuid: company.uuid,
            status: newStatus
          }
        )
      ])
    );
  };

  it("approves company and logs event", async () => {
    await expectToUpdateStatusAndLogEvent(ApprovalStatus.approved);
  });

  it("rejects company and logs event", async () => {
    await expectToUpdateStatusAndLogEvent(ApprovalStatus.rejected);
  });

  it("throws an error if no user is logged in", async () => {
    const apolloClient = client.loggedOut();
    const dataToUpdate = { uuid: company.uuid, approvalStatus: ApprovalStatus.approved };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
  });

  it("throws an error if the current user is an applicant", async () => {
    const { apolloClient } = await testClientFactory.applicant();
    const dataToUpdate = { uuid: company.uuid, approvalStatus: ApprovalStatus.approved };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("throws an error if the current user is from a company", async () => {
    const { apolloClient } = await testClientFactory.company();
    const dataToUpdate = { uuid: company.uuid, approvalStatus: ApprovalStatus.approved };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("throws an error if the company does not exists", async () => {
    const nonExistentCompanyUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const { apolloClient } = await testClientFactory.admin();
    const dataToUpdate = { uuid: nonExistentCompanyUuid, approvalStatus: ApprovalStatus.approved };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors![0].extensions!.data).toEqual({ errorType: CompanyNotUpdatedError.name });
  });

  it("throws an error if the approvalStatus is invalid", async () => {
    const { apolloClient } = await testClientFactory.admin();
    const dataToUpdate = { uuid: company.uuid, approvalStatus: "invalidApprovalStatus" };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).not.toBeUndefined();
  });
});
