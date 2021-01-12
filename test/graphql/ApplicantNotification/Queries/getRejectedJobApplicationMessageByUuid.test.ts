import { client } from "$test/graphql/ApolloTestClient";
import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApplicantNotificationNotFoundError } from "$models/ApplicantNotification/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { UUID } from "$models/UUID";
import { JobApplication } from "$models";

import { TestClientGenerator } from "$generators/TestClient";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { ApplicantNotificationGenerator } from "$generators/ApplicantNotification";

const GET_REJECTED_JOB_APPLICATION_MESSAGE_BY_UUID = gql`
  query GetRejectedJobApplicationMessageByUuid($jobApplicationUuid: ID!) {
    getRejectedJobApplicationMessageByUuid(jobApplicationUuid: $jobApplicationUuid)
  }
`;

describe("getRejectedJobApplicationMessageByUuid", () => {
  let jobApplication: JobApplication;
  const generator = ApplicantNotificationGenerator.instance;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    jobApplication = await JobApplicationGenerator.instance.withMinimumData();
  });

  const performQuery = (apolloClient: TestClient, jobApplicationUuid: string) => {
    return apolloClient.query({
      query: GET_REJECTED_JOB_APPLICATION_MESSAGE_BY_UUID,
      variables: { jobApplicationUuid }
    });
  };

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: approvalStatus });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: approvalStatus });

  it("returns the newest rejectionMessage for my JobApplication", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    await generator.rejectedJobApplication({ jobApplication });
    const secondNotification = await generator.rejectedJobApplication({ jobApplication });
    await generator.approvedJobApplication({ jobApplication });
    const { data, errors } = await performQuery(apolloClient, jobApplication.uuid);
    expect(errors).toBeUndefined();
    expect(data!.getRejectedJobApplicationMessageByUuid).toEqual(
      secondNotification.moderatorMessage
    );
  });

  it("returns an error if the jobApplication has no notification", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(ApplicantNotificationNotFoundError.name);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from an approved company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.approved);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an approved applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.approved);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
