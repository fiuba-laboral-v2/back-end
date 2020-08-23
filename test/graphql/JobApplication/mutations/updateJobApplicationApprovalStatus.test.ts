import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { TestClientGenerator } from "$generators/TestClient";
import { JobApplicationGenerator } from "$generators/JobApplication";

const UPDATE_JOB_APPLICATION_APPROVAL_STATUS = gql`
  mutation updateJobApplicationApprovalStatus($uuid: ID!, $approvalStatus: ApprovalStatus!) {
    updateJobApplicationApprovalStatus(uuid: $uuid, approvalStatus: $approvalStatus) {
      offerUuid
      applicantUuid
      extensionApprovalStatus
      graduadosApprovalStatus
    }
  }
`;

describe("updateJobApplicationApprovalStatus", () => {
  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  const expectToUpdateStatus = async (
    secretary: Secretary,
    approvalStatus: ApprovalStatus,
    statusColumn: string
  ) => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
    const { errors, data } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid, approvalStatus }
    });

    expect(errors).toBeUndefined();
    expect(data!.updateJobApplicationApprovalStatus[statusColumn]).toEqual(approvalStatus);
  };

  it("sets to pending a jobApplication by an admin from extension secretary", async () => {
    await expectToUpdateStatus(
      Secretary.extension,
      ApprovalStatus.pending,
      "extensionApprovalStatus"
    );
  });

  it("approves a jobApplication by an admin from extension secretary", async () => {
    await expectToUpdateStatus(
      Secretary.extension,
      ApprovalStatus.approved,
      "extensionApprovalStatus"
    );
  });

  it("rejects a jobApplication by an admin from extension secretary", async () => {
    await expectToUpdateStatus(
      Secretary.extension,
      ApprovalStatus.rejected,
      "extensionApprovalStatus"
    );
  });

  it("sets to pending a jobApplication by an admin from a graduados secretary", async () => {
    await expectToUpdateStatus(
      Secretary.graduados,
      ApprovalStatus.pending,
      "graduadosApprovalStatus"
    );
  });

  it("approves a jobApplication by an admin from a graduados secretary", async () => {
    await expectToUpdateStatus(
      Secretary.graduados,
      ApprovalStatus.approved,
      "graduadosApprovalStatus"
    );
  });

  it("rejects a jobApplication by an admin from a graduados secretary", async () => {
    await expectToUpdateStatus(
      Secretary.graduados,
      ApprovalStatus.rejected,
      "graduadosApprovalStatus"
    );
  });

  it("returns an error if no user is logged in", async () => {
    const apolloClient = await client.loggedOut();
    const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid, approvalStatus: ApprovalStatus.approved }
    });

    expect(errors![0].extensions!.data).toEqual({
      errorType: AuthenticationError.name
    });
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

    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns an error if the current user from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_JOB_APPLICATION_APPROVAL_STATUS,
      variables: { uuid, approvalStatus: ApprovalStatus.approved }
    });

    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });
});
