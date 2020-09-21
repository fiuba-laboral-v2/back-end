import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing";
import { client } from "$test/graphql/ApolloTestClient";

import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { OfferApprovalEventRepository } from "$models/Offer/OfferApprovalEvent";
import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Offer } from "$models";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { AdminCannotModerateOfferError, OfferNotFoundError } from "$models/Offer/Errors";

import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$test/generators/Offer";

import generateUuid from "uuid/v4";

const UPDATE_OFFER_APPROVAL_STATUS = gql`
  mutation($uuid: ID!, $approvalStatus: ApprovalStatus!) {
    updateOfferApprovalStatus(uuid: $uuid, approvalStatus: $approvalStatus) {
      uuid
      extensionApprovalStatus
      graduadosApprovalStatus
    }
  }
`;

describe("updateOfferApprovalStatus", () => {
  let offerForGraduates: Offer;
  let offerForStudents: Offer;
  let offerForStudentsAndGraduates: Offer;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    offerForGraduates = await OfferGenerator.instance.forGraduates({ companyUuid });
    offerForStudents = await OfferGenerator.instance.forStudents({ companyUuid });
    offerForStudentsAndGraduates = await OfferGenerator.instance.forStudentsAndGraduates({
      companyUuid
    });
  });

  beforeEach(() => OfferApprovalEventRepository.truncate());

  const performMutation = (apolloClient: TestClient, dataToUpdate: object) =>
    apolloClient.mutate({
      mutation: UPDATE_OFFER_APPROVAL_STATUS,
      variables: dataToUpdate
    });

  const expectToUpdateStatusAndLogEvent = async (
    newStatus: ApprovalStatus,
    secretary: Secretary,
    offer: Offer
  ) => {
    const { admin, apolloClient } = await TestClientGenerator.admin({ secretary });
    const { data, errors } = await performMutation(apolloClient, {
      uuid: offer.uuid,
      approvalStatus: newStatus
    });
    const changedColumn = {
      [Secretary.graduados]: "graduadosApprovalStatus",
      [Secretary.extension]: "extensionApprovalStatus"
    }[secretary];

    expect(errors).toBeUndefined();

    expect(data!.updateOfferApprovalStatus).toBeObjectContaining({
      uuid: offer.uuid,
      [changedColumn]: newStatus
    });

    expect(await OfferApprovalEventRepository.findAll()).toEqual([
      expect.objectContaining({
        adminUserUuid: admin.userUuid,
        offerUuid: offer.uuid,
        status: newStatus
      })
    ]);
  };

  it("approves an offer for students and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndLogEvent(
      ApprovalStatus.approved,
      Secretary.extension,
      offerForStudents
    );
  });

  it("rejects an offer for students and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndLogEvent(
      ApprovalStatus.rejected,
      Secretary.extension,
      offerForStudents
    );
  });

  it("sets an offer for students to pending and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndLogEvent(
      ApprovalStatus.pending,
      Secretary.extension,
      offerForStudents
    );
  });

  it("approves offer for both and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndLogEvent(
      ApprovalStatus.approved,
      Secretary.extension,
      offerForStudentsAndGraduates
    );
  });

  it("rejects offer for both and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndLogEvent(
      ApprovalStatus.rejected,
      Secretary.extension,
      offerForStudentsAndGraduates
    );
  });

  it("sets an offer for both to pending and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndLogEvent(
      ApprovalStatus.pending,
      Secretary.extension,
      offerForStudentsAndGraduates
    );
  });

  it("approves offer for graduados and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndLogEvent(
      ApprovalStatus.approved,
      Secretary.graduados,
      offerForGraduates
    );
  });

  it("rejects offer for graduados and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndLogEvent(
      ApprovalStatus.rejected,
      Secretary.graduados,
      offerForGraduates
    );
  });

  it("sets an offer for graduados to pending and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndLogEvent(
      ApprovalStatus.pending,
      Secretary.graduados,
      offerForGraduates
    );
  });

  it("approves offer for both and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndLogEvent(
      ApprovalStatus.approved,
      Secretary.graduados,
      offerForStudentsAndGraduates
    );
  });

  it("rejects offer for both and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndLogEvent(
      ApprovalStatus.rejected,
      Secretary.graduados,
      offerForStudentsAndGraduates
    );
  });

  it("sets an offer for both to pending and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndLogEvent(
      ApprovalStatus.pending,
      Secretary.graduados,
      offerForStudentsAndGraduates
    );
  });

  it("throws an error if the offer is for graduates and the admin is from extension", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { errors } = await performMutation(apolloClient, {
      uuid: offerForGraduates.uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: AdminCannotModerateOfferError.name
    });
  });

  it("throws an error if the offer is for students and the admin is from graduados", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.graduados });
    const { errors } = await performMutation(apolloClient, {
      uuid: offerForStudents.uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: AdminCannotModerateOfferError.name
    });
  });

  it("returns an error if no user is logged in", async () => {
    const { errors } = await performMutation(client.loggedOut(), {
      uuid: offerForStudents.uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: AuthenticationError.name
    });
  });

  it("returns an error if the current user is an applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await performMutation(apolloClient, {
      uuid: offerForStudentsAndGraduates.uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns an error if the current user is from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await performMutation(apolloClient, {
      uuid: offerForStudentsAndGraduates.uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns an error if the offer does not exists", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { errors } = await performMutation(apolloClient, {
      uuid: generateUuid(),
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: OfferNotFoundError.name
    });
  });

  it("returns an error if the approvalStatus is invalid", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await performMutation(apolloClient, {
      uuid: offerForStudentsAndGraduates.uuid,
      approvalStatus: "invalidApprovalStatus"
    });
    expect(errors).not.toBeUndefined();
  });
});
