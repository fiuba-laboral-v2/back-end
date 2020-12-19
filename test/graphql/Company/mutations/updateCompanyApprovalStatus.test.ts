import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing";
import { client } from "$test/graphql/ApolloTestClient";

import { UUID } from "$models/UUID";
import { EmailService } from "$services/Email";
import { Company } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { CompanyNotFoundError } from "$models/Company/Errors";
import { MissingModeratorMessageError } from "$models/Notification";

import { CompanyApprovalEventRepository } from "$models/Company/CompanyApprovalEvent";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CompanyNotificationRepository } from "$models/CompanyNotification";

import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";
import { UUID_REGEX } from "$test/models";

const UPDATE_COMPANY_APPROVAL_STATUS = gql`
  mutation UpdateCompanyApprovalStatus(
    $uuid: ID!
    $approvalStatus: ApprovalStatus!
    $moderatorMessage: String
  ) {
    updateCompanyApprovalStatus(
      uuid: $uuid
      approvalStatus: $approvalStatus
      moderatorMessage: $moderatorMessage
    ) {
      uuid
      approvalStatus
    }
  }
`;

describe("updateCompanyApprovalStatus", () => {
  const moderatorMessage = "message";
  let company: Company;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    company = await CompanyGenerator.instance.withMinimumData();
  });

  beforeEach(async () => {
    await CompanyApprovalEventRepository.truncate();
    jest.spyOn(EmailService, "send").mockImplementation(jest.fn());
  });

  const performMutation = (apolloClient: TestClient, dataToUpdate: object) =>
    apolloClient.mutate({
      mutation: UPDATE_COMPANY_APPROVAL_STATUS,
      variables: dataToUpdate
    });

  const updateStatus = async (approvalStatus: ApprovalStatus) => {
    const { apolloClient, admin } = await TestClientGenerator.admin();
    const dataToUpdate = { uuid: company.uuid, approvalStatus, moderatorMessage };
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
      status: approvalStatus,
      ...(approvalStatus === ApprovalStatus.rejected && { moderatorMessage })
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

  describe("Notifications", () => {
    beforeEach(() => CompanyNotificationRepository.truncate());

    it("creates a notification for a company if it is approved", async () => {
      const { admin } = await updateStatus(ApprovalStatus.approved);
      const notifications = await CompanyNotificationRepository.findAll();
      expect(notifications).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: company.uuid,
          isNew: true,
          createdAt: expect.any(Date)
        }
      ]);
    });

    it("creates a notification for a company if it is rejected", async () => {
      const { admin } = await updateStatus(ApprovalStatus.rejected);
      const notifications = await CompanyNotificationRepository.findAll();
      expect(notifications).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: company.uuid,
          moderatorMessage,
          isNew: true,
          createdAt: expect.any(Date)
        }
      ]);
    });

    it("does not create a notification for a company if it is set to pending", async () => {
      await updateStatus(ApprovalStatus.pending);
      const notifications = await CompanyNotificationRepository.findAll();
      expect(notifications).toEqual([]);
    });
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

  it("throws an error if the company does not exist", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const dataToUpdate = { uuid: UUID.generate(), approvalStatus: ApprovalStatus.approved };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).toEqualGraphQLErrorType(CompanyNotFoundError.name);
  });

  it("throws an error if the approvalStatus is invalid", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const dataToUpdate = { uuid: company.uuid, approvalStatus: "invalidApprovalStatus" };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).not.toBeUndefined();
  });

  it("throws an error if no moderatorMessage is provided when rejecting the company", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const dataToUpdate = { uuid: company.uuid, approvalStatus: ApprovalStatus.rejected };
    const { errors } = await performMutation(apolloClient, dataToUpdate);
    expect(errors).toEqualGraphQLErrorType(MissingModeratorMessageError.name);
  });
});
