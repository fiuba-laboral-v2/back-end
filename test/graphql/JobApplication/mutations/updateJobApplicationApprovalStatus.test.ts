import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { OfferRepository } from "$models/Offer";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { JobApplicationRepository } from "$models/JobApplication";
import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { EmailService } from "$services/Email";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { TestClientGenerator } from "$generators/TestClient";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";
import { CompanyNotificationRepository } from "$models/CompanyNotification";
import { UUID_REGEX } from "$test/models";

const UPDATE_JOB_APPLICATION_APPROVAL_STATUS = gql`
  mutation updateJobApplicationApprovalStatus($uuid: ID!, $approvalStatus: ApprovalStatus!) {
    updateJobApplicationApprovalStatus(uuid: $uuid, approvalStatus: $approvalStatus) {
      offerUuid
      applicantUuid
      approvalStatus
    }
  }
`;

describe("updateJobApplicationApprovalStatus", () => {
  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await CareerRepository.truncate();
    await SecretarySettingsRepository.truncate();

    await SecretarySettingsGenerator.createDefaultSettings();
  });

  beforeEach(() => {
    jest.spyOn(EmailService, "send").mockImplementation(jest.fn());
  });

  const expectToLogAnEventForStatus = async (secretary: Secretary, status: ApprovalStatus) => {
    const { apolloClient, admin } = await TestClientGenerator.admin({ secretary });
    const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid, approvalStatus: status }
    });
    expect(errors).toBeUndefined();
    const jobApplication = await JobApplicationRepository.findByUuid(uuid);
    expect(await jobApplication.getApprovalEvents()).toEqual([
      expect.objectContaining({
        adminUserUuid: admin.userUuid,
        jobApplicationUuid: jobApplication.uuid,
        status
      })
    ]);
  };

  const expectToUpdateStatus = async (secretary: Secretary, approvalStatus: ApprovalStatus) => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
    const { errors, data } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid, approvalStatus }
    });

    expect(errors).toBeUndefined();
    expect(data!.updateJobApplicationApprovalStatus.approvalStatus).toEqual(approvalStatus);
  };

  it("allows extension admin to change status to pending", async () => {
    await expectToUpdateStatus(Secretary.extension, ApprovalStatus.pending);
  });

  it("allows extension admin to change status to approved", async () => {
    await expectToUpdateStatus(Secretary.extension, ApprovalStatus.approved);
  });

  it("allows extension admin to change status to rejected", async () => {
    await expectToUpdateStatus(Secretary.extension, ApprovalStatus.rejected);
  });

  it("allows graduados admin to change status to pending", async () => {
    await expectToUpdateStatus(Secretary.graduados, ApprovalStatus.pending);
  });

  it("allows graduados admin to change status to approved", async () => {
    await expectToUpdateStatus(Secretary.graduados, ApprovalStatus.approved);
  });

  it("allows graduados admin to change status to rejected", async () => {
    await expectToUpdateStatus(Secretary.graduados, ApprovalStatus.rejected);
  });

  it("logs an event after an extension admin sets status to pending", async () => {
    await expectToLogAnEventForStatus(Secretary.extension, ApprovalStatus.pending);
  });

  it("logs an event after an extension admin sets status to approved", async () => {
    await expectToLogAnEventForStatus(Secretary.extension, ApprovalStatus.approved);
  });

  it("logs an event after an extension admin sets status to rejected", async () => {
    await expectToLogAnEventForStatus(Secretary.extension, ApprovalStatus.rejected);
  });

  it("logs an event after an graduados admin sets status to pending", async () => {
    await expectToLogAnEventForStatus(Secretary.graduados, ApprovalStatus.pending);
  });

  it("logs an event after an graduados admin sets status to approved", async () => {
    await expectToLogAnEventForStatus(Secretary.graduados, ApprovalStatus.approved);
  });

  it("logs an event after an graduados admin sets status to rejected", async () => {
    await expectToLogAnEventForStatus(Secretary.graduados, ApprovalStatus.rejected);
  });

  describe("Notifications", () => {
    const updateJobApplicationWithStatus = async (uuid: string, approvalStatus: ApprovalStatus) => {
      const secretary = Secretary.extension;
      const { apolloClient, admin } = await TestClientGenerator.admin({ secretary });
      const { data, errors } = await apolloClient.mutate({
        mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
        variables: { uuid, approvalStatus }
      });
      expect(errors).toBeUndefined();
      return { data, admin };
    };

    it("creates a notification for a company if the jobApplication is approved", async () => {
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      const { companyUuid } = await OfferRepository.findByUuid(jobApplication.offerUuid);
      const { admin } = await updateJobApplicationWithStatus(
        jobApplication.uuid,
        ApprovalStatus.approved
      );
      const { results, shouldFetchMore } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid
      });
      expect(shouldFetchMore).toBe(false);
      expect(results).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: companyUuid,
          isNew: true,
          jobApplicationUuid: jobApplication.uuid,
          createdAt: expect.any(Date)
        }
      ]);
    });

    it("does not create a notification for a company if the jobApplication is rejected", async () => {
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      const { companyUuid } = await OfferRepository.findByUuid(jobApplication.offerUuid);
      await updateJobApplicationWithStatus(jobApplication.uuid, ApprovalStatus.rejected);
      const { results, shouldFetchMore } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid
      });
      expect(shouldFetchMore).toBe(false);
      expect(results).toEqual([]);
    });

    it("does not create a notification for a companyUser if the jobApplication is pending", async () => {
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      const { companyUuid } = await OfferRepository.findByUuid(jobApplication.offerUuid);
      await updateJobApplicationWithStatus(jobApplication.uuid, ApprovalStatus.pending);
      const { results, shouldFetchMore } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid
      });
      expect(shouldFetchMore).toBe(false);
      expect(results).toEqual([]);
    });
  });

  it("returns an error if no user is logged in", async () => {
    const apolloClient = await client.loggedOut();
    const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid, approvalStatus: ApprovalStatus.approved }
    });

    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("return an error if no uuid is provided", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { approvalStatus: ApprovalStatus.approved }
    });
    expect(errors).not.toBeUndefined();
  });

  it("return an error if no approvalStatus is provided", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid }
    });
    expect(errors).not.toBeUndefined();
  });

  it("returns an error if the current user is an applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid, approvalStatus: ApprovalStatus.approved }
    });

    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid, approvalStatus: ApprovalStatus.approved }
    });

    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
