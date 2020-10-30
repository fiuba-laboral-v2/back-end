import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing";
import { client } from "../../ApolloTestClient";
import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";
import { CompanyRepository } from "$models/Company";
import { Company } from "$models";
import { CompanyApprovalEventRepository } from "$models/Company/CompanyApprovalEvent";
import { UserRepository } from "$models/User";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { CompanyNotUpdatedError } from "$models/Company/Errors";

const UPDATE_COMPANY_APPROVAL_STATUS = gql`
  mutation($uuid: ID!, $approvalStatus: ApprovalStatus!) {
    updateCompanyApprovalStatus(uuid: $uuid, approvalStatus: $approvalStatus) {
      uuid
      approvalStatus
    }
  }
`;

describe("updateCompanyApprovalStatus", () => {
  let company: Company;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    company = await CompanyGenerator.instance.withMinimumData();
  });

  beforeEach(() => CompanyApprovalEventRepository.truncate());

  const performMutation = (apolloClient: TestClient, dataToUpdate: object) =>
    apolloClient.mutate({
      mutation: UPDATE_COMPANY_APPROVAL_STATUS,
      variables: dataToUpdate
    });

  const expectToUpdateStatusAndLogEvent = async (newStatus: ApprovalStatus) => {
    const { admin, apolloClient } = await TestClientGenerator.admin();
    const dataToUpdate = { uuid: company.uuid, approvalStatus: newStatus };
    const { data, errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).toBeUndefined();
    expect(data!.updateCompanyApprovalStatus).toEqual({
      uuid: company.uuid,
      approvalStatus: newStatus
    });
    expect(await CompanyApprovalEventRepository.findAll()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userUuid: admin.userUuid,
          companyUuid: company.uuid,
          status: newStatus
        })
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
    const dataToUpdate = {
      uuid: company.uuid,
      approvalStatus: ApprovalStatus.approved
    };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("throws an error if the current user is an applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const dataToUpdate = {
      uuid: company.uuid,
      approvalStatus: ApprovalStatus.approved
    };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("throws an error if the current user is from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const dataToUpdate = {
      uuid: company.uuid,
      approvalStatus: ApprovalStatus.approved
    };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("throws an error if the company does not exists", async () => {
    const nonExistentCompanyUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const { apolloClient } = await TestClientGenerator.admin();
    const dataToUpdate = {
      uuid: nonExistentCompanyUuid,
      approvalStatus: ApprovalStatus.approved
    };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).toEqualGraphQLErrorType(CompanyNotUpdatedError.name);
  });

  it("throws an error if the approvalStatus is invalid", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const dataToUpdate = {
      uuid: company.uuid,
      approvalStatus: "invalidApprovalStatus"
    };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).not.toBeUndefined();
  });
});
