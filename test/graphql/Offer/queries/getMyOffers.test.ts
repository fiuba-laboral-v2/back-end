import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { IGetMyOffers } from "$graphql/Offer/Queries/getMyOffers";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { ApprovalStatus } from "$models/ApprovalStatus";
import { Company, Offer } from "$models";
import { ApplicantType } from "$models/Applicant";
import { Secretary } from "$models/Admin";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { OfferRepository } from "$models/Offer";

import { IForAllTargetsAndStatuses, OfferGenerator } from "$generators/Offer";
import { TestClientGenerator } from "$generators/TestClient";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

const GET_MY_OFFERS = gql`
  query getMyOffers($updatedBeforeThan: PaginatedInput, $hideRejectedAndExpiredOffers: Boolean!) {
    getMyOffers(
      updatedBeforeThan: $updatedBeforeThan
      hideRejectedAndExpiredOffers: $hideRejectedAndExpiredOffers
    ) {
      shouldFetchMore
      results {
        uuid
      }
    }
  }
`;

describe("getMyOffers", () => {
  let companyApolloClient;
  let company: Company;
  let companyUuid: string;
  let offers: IForAllTargetsAndStatuses;
  let allOffers: Offer[];
  let allOfferUuids: string[];
  let expiredOfferForGraduates: Offer;
  let expiredOfferForStudents: Offer;
  let expiredOfferForBoth: Offer;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();

    const companyClient = await TestClientGenerator.company({ status: ApprovalStatus.approved });
    companyApolloClient = companyClient.apolloClient;
    company = companyClient.company;
    companyUuid = company.uuid;
    offers = await OfferGenerator.instance.forAllTargetsAndStatuses({ companyUuid });
    expiredOfferForGraduates = await OfferGenerator.instance.forGraduates({ companyUuid });
    expiredOfferForStudents = await OfferGenerator.instance.forStudents({ companyUuid });
    expiredOfferForBoth = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
    expiredOfferForGraduates.expire();
    expiredOfferForStudents.expire();
    expiredOfferForBoth.expire();
    await OfferRepository.save(expiredOfferForGraduates);
    await OfferRepository.save(expiredOfferForStudents);
    await OfferRepository.save(expiredOfferForBoth);
    allOffers = [
      offers[ApplicantType.student][ApprovalStatus.pending],
      offers[ApplicantType.student][ApprovalStatus.approved],
      offers[ApplicantType.student][ApprovalStatus.rejected],
      offers[ApplicantType.graduate][ApprovalStatus.pending],
      offers[ApplicantType.graduate][ApprovalStatus.approved],
      offers[ApplicantType.graduate][ApprovalStatus.rejected],
      offers[ApplicantType.both][ApprovalStatus.pending],
      offers[ApplicantType.both][ApprovalStatus.approved],
      offers[ApplicantType.both][ApprovalStatus.rejected],
      expiredOfferForGraduates,
      expiredOfferForStudents,
      expiredOfferForBoth
    ];
    allOffers = allOffers.sort(offer => -offer.updatedAt);
    allOfferUuids = allOffers.map(({ uuid }) => uuid);
  });

  const getMyOffers = (variables: IGetMyOffers, apolloClient?: TestClient) =>
    (apolloClient || companyApolloClient).query({ query: GET_MY_OFFERS, variables });

  it("returns all the offers from the current company", async () => {
    const { data, errors } = await getMyOffers({ hideRejectedAndExpiredOffers: false });
    expect(errors).toBeUndefined();
    const { shouldFetchMore, results } = data!.getMyOffers;
    const resultUuids = results.map(({ uuid }) => uuid);
    expect(shouldFetchMore).toEqual(false);
    expect(resultUuids).toEqual(expect.arrayContaining(allOfferUuids));
  });

  it("returns the offers that are approved or pending for graduates or students", async () => {
    const { data, errors } = await getMyOffers({ hideRejectedAndExpiredOffers: true });
    expect(errors).toBeUndefined();
    const { shouldFetchMore, results } = data!.getMyOffers;
    const resultUuids = results.map(({ uuid }) => uuid);
    const expectedUuids = [
      offers[ApplicantType.student][ApprovalStatus.pending].uuid,
      offers[ApplicantType.student][ApprovalStatus.approved].uuid,
      offers[ApplicantType.graduate][ApprovalStatus.pending].uuid,
      offers[ApplicantType.graduate][ApprovalStatus.approved].uuid,
      offers[ApplicantType.both][ApprovalStatus.pending].uuid,
      offers[ApplicantType.both][ApprovalStatus.approved].uuid
    ];
    expect(shouldFetchMore).toEqual(false);
    expect(resultUuids).toHaveLength(expectedUuids.length);
    expect(resultUuids).toEqual(expect.arrayContaining(expectedUuids));
  });

  describe("pagination", () => {
    it("gets the latest 10 offers", async () => {
      const itemsPerPage = 10;
      mockItemsPerPage(itemsPerPage);
      const { data } = await getMyOffers({ hideRejectedAndExpiredOffers: false });
      expect(data!.getMyOffers.results.map(offer => offer.uuid)).toEqual(
        allOffers.slice(0, itemsPerPage).map(offer => offer.uuid)
      );
      expect(data!.getMyOffers.shouldFetchMore).toEqual(true);
    });

    it("gets the next 3 offers", async () => {
      const itemsPerPage = 3;
      const lastOfferIndex = 7;
      mockItemsPerPage(itemsPerPage);
      const lastOffer = allOffers[lastOfferIndex];
      const { data } = await getMyOffers({
        updatedBeforeThan: {
          dateTime: lastOffer.updatedAt.toISOString(),
          uuid: lastOffer.uuid
        },
        hideRejectedAndExpiredOffers: false
      });
      const { results, shouldFetchMore } = data!.getMyOffers;
      const resultUuids = results.map(({ uuid }) => uuid);

      expect(resultUuids).toEqual(
        allOffers
          .slice(lastOfferIndex + 1, lastOfferIndex + 1 + itemsPerPage)
          .map(offer => offer.uuid)
      );
      expect(shouldFetchMore).toEqual(true);
    });
  });

  it("returns no offers if the current company does not have ny", async () => {
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
    const { data, errors } = await getMyOffers(
      { hideRejectedAndExpiredOffers: false },
      apolloClient
    );
    expect(errors).toBeUndefined();
    expect(data!.getMyOffers.shouldFetchMore).toEqual(false);
    expect(data!.getMyOffers.results).toHaveLength(0);
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const { errors } = await getMyOffers({ hideRejectedAndExpiredOffers: false }, apolloClient);

      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if current user is not a companyUser", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await getMyOffers({ hideRejectedAndExpiredOffers: false }, apolloClient);

      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if company has pending status", async () => {
      const status = ApprovalStatus.pending;
      const { apolloClient } = await TestClientGenerator.company({ status });
      const { errors } = await getMyOffers({ hideRejectedAndExpiredOffers: false }, apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if company has rejected status", async () => {
      const status = ApprovalStatus.rejected;
      const { apolloClient } = await TestClientGenerator.company({ status });
      const { errors } = await getMyOffers({ hideRejectedAndExpiredOffers: false }, apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if currentUser is an extensionAdmin", async () => {
      const secretary = Secretary.extension;
      const { apolloClient } = await TestClientGenerator.admin({ secretary });
      const { errors } = await getMyOffers({ hideRejectedAndExpiredOffers: false }, apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if currentUser is a graduadosAdmin", async () => {
      const secretary = Secretary.graduados;
      const { apolloClient } = await TestClientGenerator.admin({ secretary });
      const { errors } = await getMyOffers({ hideRejectedAndExpiredOffers: false }, apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
