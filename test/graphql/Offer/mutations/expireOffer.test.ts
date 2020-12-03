import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing";

import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Offer } from "$models";

import { TestClientGenerator } from "$generators/TestClient";
import { IForAllTargets, OfferGenerator } from "$test/generators/Offer";

import { ApplicantType } from "$models/Applicant";
import moment from "moment";
import { AdminGenerator } from "$test/generators/Admin";
import { client } from "$test/graphql/ApolloTestClient";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { UUID } from "$models/UUID";
import { OfferNotFoundError, OfferRepository } from "$models/Offer";
import { SecretarySettingsGenerator } from "$test/generators/SecretarySettings";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

const EXPIRE_OFFER = gql`
  mutation($uuid: ID!) {
    expireOffer(uuid: $uuid) {
      uuid
      targetApplicantType
      studentsExpirationDateTime
      graduatesExpirationDateTime
    }
  }
`;

describe("expireOffer", () => {
  let offers: IForAllTargets;
  let company;
  let companyApolloClient;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await OfferRepository.truncate();
    await SecretarySettingsRepository.truncate();
    await SecretarySettingsGenerator.createDefaultSettings();
    const admin = await AdminGenerator.extension();
    ({ apolloClient: companyApolloClient, company } = await TestClientGenerator.company({
      status: { admin, approvalStatus: ApprovalStatus.approved }
    }));
    offers = await OfferGenerator.instance.forAllTargets({
      status: ApprovalStatus.approved,
      companyUuid: company.uuid
    });
  });

  const performMutation = (apolloClient: TestClient, variables: object) =>
    apolloClient.mutate({
      mutation: EXPIRE_OFFER,
      variables
    });

  const hasExpired = offer => {
    const offerTarget = offer.targetApplicantType;

    return {
      [ApplicantType.both]:
        new Date(offer.graduatesExpirationDateTime) < moment().toDate() &&
        new Date(offer.studentsExpirationDateTime) < moment().toDate(),
      [ApplicantType.graduate]: new Date(offer.graduatesExpirationDateTime) < moment().toDate(),
      [ApplicantType.student]: new Date(offer.studentsExpirationDateTime) < moment().toDate()
    }[offerTarget];
  };

  const expectToExpireTheOffer = async (offer: Offer) => {
    const { data, errors } = await performMutation(companyApolloClient, {
      uuid: offer.uuid
    });

    expect(errors).toBeUndefined();

    expect(hasExpired(offer)).toBe(false);

    expect(hasExpired(data!.expireOffer)).toBe(true);
  };

  it("expires an offer for students that didn't reach their expiration date", async () => {
    await expectToExpireTheOffer(offers[ApplicantType.student]);
  });

  it("expires an offer for graduates that didn't reach their expiration date", async () => {
    await expectToExpireTheOffer(offers[ApplicantType.graduate]);
  });

  it("expires an offer for both that didn't reach their expiration date", async () => {
    await expectToExpireTheOffer(offers[ApplicantType.both]);
  });

  it("returns an error if no user is logged in", async () => {
    const { errors } = await performMutation(client.loggedOut(), {
      uuid: offers[ApplicantType.student].uuid
    });
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is an applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an approved applicant", async () => {
    const admin = await AdminGenerator.extension();
    const { apolloClient } = await TestClientGenerator.applicant({
      status: { admin, approvalStatus: ApprovalStatus.approved }
    });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const admin = await AdminGenerator.extension();
    const { apolloClient } = await TestClientGenerator.applicant({
      status: { admin, approvalStatus: ApprovalStatus.rejected }
    });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a company pending", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const admin = await AdminGenerator.extension();
    const { apolloClient } = await TestClientGenerator.company({
      status: { admin, approvalStatus: ApprovalStatus.rejected }
    });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const admin = await AdminGenerator.extension();
    const { apolloClient } = await TestClientGenerator.company({
      status: { admin, approvalStatus: ApprovalStatus.rejected }
    });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from an admin", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the offer does not exists", async () => {
    const admin = await AdminGenerator.extension();
    const { apolloClient } = await TestClientGenerator.company({
      status: { admin, approvalStatus: ApprovalStatus.approved }
    });
    const { errors } = await performMutation(apolloClient, {
      uuid: UUID.generate()
    });
    expect(errors).toEqualGraphQLErrorType(OfferNotFoundError.name);
  });
});
