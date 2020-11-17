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
import { IForAllTargets, OfferGenerator } from "$test/generators/Offer";

import { v4 as generateUuid } from "uuid";
import { ApplicantType } from "$models/Applicant";
import moment from "moment";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";

const UPDATE_OFFER_APPROVAL_STATUS = gql`
  mutation($uuid: ID!, $approvalStatus: ApprovalStatus!) {
    updateOfferApprovalStatus(uuid: $uuid, approvalStatus: $approvalStatus) {
      uuid
      extensionApprovalStatus
      graduadosApprovalStatus
      studentsExpirationDateTime
      graduatesExpirationDateTime
    }
  }
`;

describe("updateOfferApprovalStatus", () => {
  let offers: IForAllTargets;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    offers = await OfferGenerator.instance.forAllTargets({
      status: ApprovalStatus.pending,
      companyUuid
    });
  });

  beforeEach(() => OfferApprovalEventRepository.truncate());

  const performMutation = (apolloClient: TestClient, dataToUpdate: object) =>
    apolloClient.mutate({
      mutation: UPDATE_OFFER_APPROVAL_STATUS,
      variables: dataToUpdate
    });

  const expectToUpdateStatusAndExpirationDateAndLogEvent = async (
    newStatus: ApprovalStatus,
    secretary: Secretary,
    offer: Offer
  ) => {
    const { admin, apolloClient } = await TestClientGenerator.admin({ secretary });
    const { data, errors } = await performMutation(apolloClient, {
      uuid: offer.uuid,
      approvalStatus: newStatus
    });
    const changedStatusColumn = {
      [Secretary.graduados]: "graduadosApprovalStatus",
      [Secretary.extension]: "extensionApprovalStatus"
    }[secretary];

    const changedExpirationColumn = {
      [Secretary.graduados]: "graduatesExpirationDateTime",
      [Secretary.extension]: "studentsExpirationDateTime"
    }[secretary];

    const { offerDurationInDays } = await SecretarySettingsRepository.findBySecretary(secretary);

    const expirationDate = {
      [ApprovalStatus.approved]: moment()
        .endOf("day")
        .add(offerDurationInDays, "days")
        .toISOString(),
      [ApprovalStatus.rejected]: moment().startOf("day").toISOString(),
      [ApprovalStatus.pending]: null
    }[newStatus];

    expect(errors).toBeUndefined();

    expect(data!.updateOfferApprovalStatus).toBeObjectContaining({
      uuid: offer.uuid,
      [changedStatusColumn]: newStatus,
      [changedExpirationColumn]: expirationDate
    });

    expect(await OfferApprovalEventRepository.findAll()).toEqual([
      expect.objectContaining({
        adminUserUuid: admin.userUuid,
        offerUuid: offer.uuid,
        status: newStatus
      })
    ]);
  };

  it("sets an offer for students to pending and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.pending,
      Secretary.extension,
      offers[ApplicantType.student]
    );
  });

  it("approves an offer for students and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.approved,
      Secretary.extension,
      offers[ApplicantType.student]
    );
  });

  it("rejects an offer for students and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.rejected,
      Secretary.extension,
      offers[ApplicantType.student]
    );
  });

  it("sets an offer for both to pending and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.pending,
      Secretary.extension,
      offers[ApplicantType.both]
    );
  });

  it("approves offer for both and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.approved,
      Secretary.extension,
      offers[ApplicantType.both]
    );
  });

  it("rejects offer for both and logs event for an admin of extension", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.rejected,
      Secretary.extension,
      offers[ApplicantType.both]
    );
  });

  it("sets an offer for graduados to pending and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.pending,
      Secretary.graduados,
      offers[ApplicantType.graduate]
    );
  });

  it("approves offer for graduados and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.approved,
      Secretary.graduados,
      offers[ApplicantType.graduate]
    );
  });

  it("rejects offer for graduados and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.rejected,
      Secretary.graduados,
      offers[ApplicantType.graduate]
    );
  });

  it("sets an offer for both to pending and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.pending,
      Secretary.graduados,
      offers[ApplicantType.both]
    );
  });

  it("approves offer for both and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.approved,
      Secretary.graduados,
      offers[ApplicantType.both]
    );
  });

  it("rejects offer for both and logs event for an admin of graduados", async () => {
    await expectToUpdateStatusAndExpirationDateAndLogEvent(
      ApprovalStatus.rejected,
      Secretary.graduados,
      offers[ApplicantType.both]
    );
  });

  it("throws an error if the offer is for graduates and the admin is from extension", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.graduate].uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(AdminCannotModerateOfferError.name);
  });

  it("throws an error if the offer is for students and the admin is from graduados", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.graduados });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.student].uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(AdminCannotModerateOfferError.name);
  });

  it("returns an error if no user is logged in", async () => {
    const { errors } = await performMutation(client.loggedOut(), {
      uuid: offers[ApplicantType.student].uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is an applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid,
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the offer does not exists", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { errors } = await performMutation(apolloClient, {
      uuid: generateUuid(),
      approvalStatus: ApprovalStatus.approved
    });
    expect(errors).toEqualGraphQLErrorType(OfferNotFoundError.name);
  });

  it("returns an error if the approvalStatus is invalid", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid,
      approvalStatus: "invalidApprovalStatus"
    });
    expect(errors).not.toBeUndefined();
  });
});
