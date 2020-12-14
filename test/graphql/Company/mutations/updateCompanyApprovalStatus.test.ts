import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing";
import { client } from "../../ApolloTestClient";

import { UUID } from "$models/UUID";
import { Company } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { CompanyNotUpdatedError } from "$models/Company/Errors";

import { CompanyApprovalEventRepository } from "$models/Company/CompanyApprovalEvent";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";

import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";

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

  const updateStatus = async (approvalStatus: ApprovalStatus) => {
    const { apolloClient, admin } = await TestClientGenerator.admin();
    const dataToUpdate = { uuid: company.uuid, approvalStatus };
    const { data, errors } = await performMutation(apolloClient, dataToUpdate);
    return { data, errors, admin };
  };

  const expectToUpdateStatus = async (approvalStatus: ApprovalStatus) => {
    const { data, errors } = await updateStatus(approvalStatus);
    expect(errors).toBeUndefined();
    expect(data!.updateCompanyApprovalStatus).toEqual({
      uuid: company.uuid,
      approvalStatus
    });
  };

  const expectToLogEvent = async (approvalStatus: ApprovalStatus) => {
    const { errors, admin } = await updateStatus(approvalStatus);
    expect(errors).toBeUndefined();
    const [event] = await CompanyApprovalEventRepository.findAll();
    expect(event).toBeObjectContaining({
      userUuid: admin.userUuid,
      companyUuid: company.uuid,
      status: approvalStatus
    });
  };

  it("sets company status to pending", async () => {
    await expectToUpdateStatus(ApprovalStatus.pending);
  });

  it("approves company", async () => {
    await expectToUpdateStatus(ApprovalStatus.approved);
  });

  it("rejects company", async () => {
    await expectToUpdateStatus(ApprovalStatus.rejected);
  });

  it("logs an event after approving the  company", async () => {
    await expectToLogEvent(ApprovalStatus.approved);
  });

  it("logs an event after rejecting the  company", async () => {
    await expectToLogEvent(ApprovalStatus.rejected);
  });

  it("logs an event after changing the  company status to pending", async () => {
    await expectToLogEvent(ApprovalStatus.pending);
  });

  it("does not log an event if the status update fails", async () => {
    const { errors } = await updateStatus("InvalidApprovalStatus" as ApprovalStatus);
    const events = await CompanyApprovalEventRepository.findAll();

    expect(errors).not.toBeUndefined();
    expect(events).toEqual([]);
  });

  it("does not update the status if the event log fails", async () => {
    jest.spyOn(CompanyApprovalEventRepository, "save").mockImplementation(() => {
      throw new Error();
    });
    company.set({ approvalStatus: ApprovalStatus.pending });
    CompanyRepository.save(company);
    expect(company.approvalStatus).toEqual(ApprovalStatus.pending);
    const { errors } = await updateStatus(ApprovalStatus.rejected);

    expect(errors).not.toBeUndefined();
    expect(company.approvalStatus).toEqual(ApprovalStatus.pending);
  });

  it("throws an error if no user is logged in", async () => {
    const apolloClient = client.loggedOut();
    const dataToUpdate = { uuid: company.uuid, approvalStatus: ApprovalStatus.approved };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("throws an error if the current user is an applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const dataToUpdate = { uuid: company.uuid, approvalStatus: ApprovalStatus.approved };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("throws an error if the current user is from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const dataToUpdate = { uuid: company.uuid, approvalStatus: ApprovalStatus.approved };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("throws an error if the company does not exists", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const dataToUpdate = { uuid: UUID.generate(), approvalStatus: ApprovalStatus.approved };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).toEqualGraphQLErrorType(CompanyNotUpdatedError.name);
  });

  it("throws an error if the approvalStatus is invalid", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const dataToUpdate = { uuid: company.uuid, approvalStatus: "invalidApprovalStatus" };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).not.toBeUndefined();
  });
});
