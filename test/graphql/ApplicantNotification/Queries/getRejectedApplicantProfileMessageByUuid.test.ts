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
import { Applicant } from "$models";

import { TestClientGenerator } from "$generators/TestClient";
import { ApplicantGenerator } from "$generators/Applicant";
import { ApplicantNotificationGenerator } from "$generators/ApplicantNotification";

const GET_REJECTED_APPLICANT_PROFILE_MESSAGE_BY_UUID = gql`
  query GetRejectedApplicantProfileMessageByUuid($notifiedApplicantUuid: ID!) {
    getRejectedApplicantProfileMessageByUuid(notifiedApplicantUuid: $notifiedApplicantUuid)
  }
`;

describe("getRejectedApplicantProfileMessageByUuid", () => {
  let applicant: Applicant;
  const generator = ApplicantNotificationGenerator.instance;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    applicant = await ApplicantGenerator.instance.studentAndGraduate();
  });

  const performQuery = (apolloClient: TestClient, notifiedApplicantUuid: string) => {
    return apolloClient.query({
      query: GET_REJECTED_APPLICANT_PROFILE_MESSAGE_BY_UUID,
      variables: { notifiedApplicantUuid }
    });
  };

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: approvalStatus });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: approvalStatus });

  it("returns the newest rejectionMessage for my applicant", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    await generator.rejectedProfile({ applicant });
    const secondNotification = await generator.rejectedProfile({ applicant });
    await generator.approvedProfile({ applicant });
    const { data, errors } = await performQuery(apolloClient, applicant.uuid);
    expect(errors).toBeUndefined();
    expect(data!.getRejectedApplicantProfileMessageByUuid).toEqual(
      secondNotification.moderatorMessage
    );
  });

  it("returns an error if the applicant has no notification", async () => {
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
