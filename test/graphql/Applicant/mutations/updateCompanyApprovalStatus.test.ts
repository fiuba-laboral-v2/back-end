import { Database } from "../../../../src/config/Database";
import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { ApplicantNotUpdatedError, ApplicantRepository } from "../../../../src/models/Applicant";
import { Applicant } from "../../../../src/models";
import {
  ApplicantApprovalEventRepository
} from "../../../../src/models/Applicant/ApplicantApprovalEvent";
import { UserRepository } from "../../../../src/models/User";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

import { ApplicantGenerator, TApplicantGenerator } from "../../../generators/Applicant";
import { testClientFactory } from "../../../mocks/testClientFactory";
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
  let applicants: TApplicantGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    await ApplicantRepository.truncate();
    applicants = ApplicantGenerator.instance.withMinimumData();
  });

  beforeEach(() => ApplicantApprovalEventRepository.truncate());

  afterAll(() => Database.close());

  const performMutation = (apolloClient: TestClient, dataToUpdate: object) =>
    apolloClient.mutate({
      mutation: UPDATE_APPLICANT_APPROVAL_STATUS,
      variables: dataToUpdate
    });

  const updateApplicantWithStatus = async (newStatus: ApprovalStatus) => {
    const applicant = await applicants.next().value;
    const { admin, apolloClient } = await testClientFactory.admin();
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
      applicant = await applicants.next().value;
    });

    it("returns an error if no uuid is provided", async () => {
      const { apolloClient } = await testClientFactory.admin();
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
      const { apolloClient } = await testClientFactory.company();
      const dataToUpdate = { uuid: applicant.uuid, approvalStatus: ApprovalStatus.approved };
      const { errors } = await performMutation(apolloClient, dataToUpdate);
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if the current user is an applicant", async () => {
      const { apolloClient } = await testClientFactory.applicant();
      const dataToUpdate = { uuid: applicant.uuid, approvalStatus: ApprovalStatus.approved };
      const { errors } = await performMutation(apolloClient, dataToUpdate);
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if the applicant does not exists", async () => {
      const nonExistentApplicantUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      const { apolloClient } = await testClientFactory.admin();
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
      const { apolloClient } = await testClientFactory.admin();
      const dataToUpdate = { uuid: applicant.uuid, approvalStatus: "invalidApprovalStatus" };
      const { errors } = await performMutation(apolloClient, dataToUpdate);
      expect(errors).not.toBeUndefined();
    });
  });
});
