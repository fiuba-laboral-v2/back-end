import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin, Offer } from "$models";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { OfferRepository } from "$models/Offer";

import { CareerGenerator } from "$generators/Career";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";
import { range } from "lodash";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

const GET_MY_OFFERS = gql`
  query getMyOffers($updatedBeforeThan: PaginatedInput) {
    getMyOffers(updatedBeforeThan: $updatedBeforeThan) {
      shouldFetchMore
      results {
        uuid
      }
    }
  }
`;

describe("getMyOffers", () => {
  let admin: Admin;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    admin = await AdminGenerator.extension();
  });

  describe("when offers exist", () => {
    let offer1;
    let offer2;
    let apolloClient;
    let company;

    const createOffers = async (companyUuid: string) => {
      const { uuid } = await CompanyGenerator.instance.withMinimumData();
      const career1 = await CareerGenerator.instance();
      const career2 = await CareerGenerator.instance();
      offer1 = await OfferGenerator.instance.withObligatoryData({
        companyUuid,
        careers: [{ careerCode: career1.code }]
      });
      offer2 = await OfferGenerator.instance.withObligatoryData({
        companyUuid,
        careers: [{ careerCode: career2.code }]
      });
      await OfferGenerator.instance.withObligatoryData({
        companyUuid: uuid,
        careers: [{ careerCode: career1.code }]
      });
    };

    beforeAll(async () => {
      const companyClient = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      apolloClient = companyClient.apolloClient;
      company = companyClient.company;
    });

    it("returns only the offers that the company made, by updatedAt desc", async () => {
      await createOffers(company.uuid);
      const { data, errors } = await apolloClient.query({
        query: GET_MY_OFFERS
      });
      expect(errors).toBeUndefined();
      expect(data!.getMyOffers.shouldFetchMore).toEqual(false);
      expect(data!.getMyOffers.results).toHaveLength(2);
      expect(data!.getMyOffers.results).toMatchObject([
        { uuid: offer2.uuid },
        { uuid: offer1.uuid }
      ]);
    });

    describe("pagination", () => {
      let newOffersByDescUpdatedAt: Offer[] = [];

      beforeAll(async () => {
        for (const _ of range(15)) {
          newOffersByDescUpdatedAt.push(
            await OfferGenerator.instance.withObligatoryData({
              companyUuid: company.uuid
            })
          );
        }
        newOffersByDescUpdatedAt = newOffersByDescUpdatedAt.sort(offer => -offer.updatedAt);
      });

      it("gets the latest 10 offers", async () => {
        const itemsPerPage = 10;
        mockItemsPerPage(itemsPerPage);
        const { data } = await apolloClient.query({ query: GET_MY_OFFERS });
        expect(data!.getMyOffers.results.map(offer => offer.uuid)).toEqual(
          newOffersByDescUpdatedAt.slice(0, itemsPerPage).map(offer => offer.uuid)
        );
        expect(data!.getMyOffers.shouldFetchMore).toEqual(true);
      });

      it("gets the next 3 offers", async () => {
        const itemsPerPage = 3;
        const lastOfferIndex = 9;
        mockItemsPerPage(itemsPerPage);
        const lastOffer = newOffersByDescUpdatedAt[lastOfferIndex];
        const { data } = await apolloClient.query({
          query: GET_MY_OFFERS,
          variables: {
            updatedBeforeThan: {
              dateTime: lastOffer.updatedAt.toISOString(),
              uuid: lastOffer.uuid
            }
          }
        });
        expect(data!.getMyOffers.results.map(offer => offer.uuid)).toEqual(
          newOffersByDescUpdatedAt
            .slice(lastOfferIndex + 1, lastOfferIndex + 1 + itemsPerPage)
            .map(offer => offer.uuid)
        );
        expect(data!.getMyOffers.shouldFetchMore).toEqual(true);
      });
    });
  });

  describe("when no offers exists", () => {
    it("returns no offers when no offers were created", async () => {
      await OfferRepository.truncate();
      const { apolloClient } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      const { data, errors } = await apolloClient.query({
        query: GET_MY_OFFERS
      });

      expect(errors).toBeUndefined();
      expect(data!.getMyOffers.shouldFetchMore).toEqual(false);
      expect(data!.getMyOffers.results).toHaveLength(0);
    });
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const { errors } = await apolloClient.query({
        query: GET_MY_OFFERS
      });

      expect(errors).toIncludeGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if current user is not a companyUser", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.query({ query: GET_MY_OFFERS });

      expect(errors).toIncludeGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if company has pending status", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.pending
        }
      });
      const { errors } = await apolloClient.query({ query: GET_MY_OFFERS });
      expect(errors).toIncludeGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if company has rejected status", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.rejected
        }
      });
      const { errors } = await apolloClient.query({ query: GET_MY_OFFERS });
      expect(errors).toIncludeGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
