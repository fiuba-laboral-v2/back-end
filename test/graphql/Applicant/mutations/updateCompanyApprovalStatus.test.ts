import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { ApplicantNotUpdatedError, ApplicantRepository } from "$models/Applicant";
import { Applicant } from "$models";
import {
  ApplicantApprovalEventRepository
} from "$models/Applicant/ApplicantApprovalEvent";
import { UserRepository } from "$models/User";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { ApplicantGenerator } from "$generators/Applicant";
import { TestClientGenerator } from "$generators/TestClient";
import { client } from "../../ApolloTestClient";

const UPDATE_APPLICANT_APPROVAL_STATUS = gql`
  mutation ($uuid: ID!, $approvalStatus: ApprovalStatus!) {
    updateApplicantApprovalStatus(uuid: $uuid, approvalStatus: $approvalStatus) {
      uuid
      approvalStatus
    }
  }
`;

describe("updateCompanyApprovalStatus", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await ApplicantRepository.truncate();
  });

  beforeEach(() => ApplicantApprovalEventRepository.truncate());

  const performMutation = (apolloClient: TestClient, dataToUpdate: object) =>
    apolloClient.mutate({
      mutation: UPDATE_APPLICANT_APPROVAL_STATUS,
      variables: dataToUpdate
    });

  const updateApplicantWithStatus = async (newStatus: ApprovalStatus) => {
    const applicant = await ApplicantGenerator.instance.withMinimumData();
    const { admin, apolloClient } = await TestClientGenerator.admin();
    const dataToUpdate = { uuid: applicant.uuid, approvalStatus: newStatus };
    const { data, errors } = await performMutation(apolloClient, dataToUpdate);
    return { data, errors, admin, applicant };
  };

  const expectApplicantToBeUpdatedWithStatus = async (newStatus: ApprovalStatus) => {
    const { applicant, data } = await updateApplicantWithStatus(newStatus);
    expect(data!.updateApplicantApprovalStatus).toEqual({
      uuid: applicant.uuid,
      approvalStatus: newStatus
    });
  };

  const expectToCreateANewEventWithStatus = async (newStatus: ApprovalStatus) => {
    const { errors, applicant, admin } = await updateApplicantWithStatus(newStatus);
    expect(errors).toBeUndefined();
    expect(await ApplicantApprovalEventRepository.findAll()).toEqual([
      expect.objectContaining({
        adminUserUuid: admin.userUuid,
        applicantUuid: applicant.uuid,
        status: newStatus
      })
    ]);
  };

  it("approves an applicant", async () => {
    await expectApplicantToBeUpdatedWithStatus(ApprovalStatus.approved);
  });

  it("rejects an applicant", async () => {
    await expectApplicantToBeUpdatedWithStatus(ApprovalStatus.rejected);
  });

  it("creates a new event after approving an applicant", async () => {
    await expectToCreateANewEventWithStatus(ApprovalStatus.approved);
  });

  it("creates a new event after rejecting an applicant", async () => {
    await expectToCreateANewEventWithStatus(ApprovalStatus.rejected);
  });

  describe("Errors", () => {
    let applicant: Applicant;

    beforeAll(async () => {
      applicant = await ApplicantGenerator.instance.withMinimumData();
    });

    it("returns an error if no uuid is provided", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const dataToUpdate = { approvalStatus: ApprovalStatus.approved };
      const { errors } = await performMutation(apolloClient, dataToUpdate);
      expect(errors).not.toBeUndefined();
    });

    it("returns an error if no user is logged in", async () => {
      const apolloClient = client.loggedOut();
      const dataToUpdate = { uuid: applicant.uuid, approvalStatus: ApprovalStatus.approved };
      const { errors } = await performMutation(apolloClient, dataToUpdate);
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("returns an error if the current user is from a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const dataToUpdate = { uuid: applicant.uuid, approvalStatus: ApprovalStatus.approved };
      const { errors } = await performMutation(apolloClient, dataToUpdate);
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if the current user is an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const dataToUpdate = { uuid: applicant.uuid, approvalStatus: ApprovalStatus.approved };
      const { errors } = await performMutation(apolloClient, dataToUpdate);
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if the applicant does not exists", async () => {
      const nonExistentApplicantUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      const { apolloClient } = await TestClientGenerator.admin();
      const { errors } = await performMutation(
        apolloClient,
        {
          uuid: nonExistentApplicantUuid,
          approvalStatus: ApprovalStatus.approved
        }
      );
      expect(errors![0].extensions!.data).toEqual({ errorType: ApplicantNotUpdatedError.name });
    });

    it("returns an error if the approvalStatus is invalid", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const dataToUpdate = { uuid: applicant.uuid, approvalStatus: "invalidApprovalStatus" };
      const { errors } = await performMutation(apolloClient, dataToUpdate);
      expect(errors).not.toBeUndefined();
    });
  });
});
