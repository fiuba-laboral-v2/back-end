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
import { client } from "$test/graphql/ApolloTestClient";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { UUID } from "$models/UUID";
import { OfferNotFoundError } from "$models/Offer";
import { OfferNotVisibleByCurrentUserError } from "$graphql/Offer/Queries/Errors";
import { CareerRepository } from "$models/Career";

const REPUBLISH_OFFER = gql`
  mutation($uuid: ID!) {
    republishOffer(uuid: $uuid) {
      uuid
      targetApplicantType
      studentsExpirationDateTime
      graduatesExpirationDateTime
    }
  }
`;

describe("republishOffer", () => {
  let offers: IForAllTargets;
  let company;
  let companyApolloClient;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await CareerRepository.truncate();

    ({ apolloClient: companyApolloClient, company } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    }));
    offers = await OfferGenerator.instance.forAllTargets({
      status: ApprovalStatus.approved,
      companyUuid: company.uuid,
      expired: true
    });
  });

  const performMutation = (apolloClient: TestClient, variables: object) =>
    apolloClient.mutate({
      mutation: REPUBLISH_OFFER,
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

  const expectToRepublishTheOffer = async (offer: Offer) => {
    const { data, errors } = await performMutation(companyApolloClient, {
      uuid: offer.uuid
    });

    expect(errors).toBeUndefined();

    expect(hasExpired(offer)).toBe(true);

    expect(hasExpired(data!.republishOffer)).toBe(false);
  };

  it("republish an offer for students that expired", async () => {
    await expectToRepublishTheOffer(offers[ApplicantType.student]);
  });

  it("republish an offer for graduates that expired", async () => {
    await expectToRepublishTheOffer(offers[ApplicantType.graduate]);
  });

  it("republish an offer for both that expired", async () => {
    await expectToRepublishTheOffer(offers[ApplicantType.both]);
  });

  it("returns an error if no user is logged in", async () => {
    const { errors } = await performMutation(client.loggedOut(), {
      uuid: offers[ApplicantType.student].uuid
    });
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an approved applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved
    });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.rejected
    });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.rejected });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from an approved company that didn't made the offer", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.approved });
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(OfferNotVisibleByCurrentUserError.name);
  });

  it("returns an error if the current user is from an admin", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await performMutation(apolloClient, {
      uuid: offers[ApplicantType.both].uuid
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the offer does not exist", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.approved });
    const { errors } = await performMutation(apolloClient, {
      uuid: UUID.generate()
    });
    expect(errors).toEqualGraphQLErrorType(OfferNotFoundError.name);
  });
});
