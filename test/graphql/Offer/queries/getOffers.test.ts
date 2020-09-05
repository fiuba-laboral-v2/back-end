import { gql } from "apollo-server";

import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { OfferRepository } from "$models/Offer";
import { UserRepository } from "$models/User";

import { CareerGenerator } from "$generators/Career";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { TestClientGenerator } from "$generators/TestClient";
import { UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AdminGenerator } from "$generators/Admin";
import { range } from "lodash";
import { Offer } from "$models";
import { Secretary } from "$models/Admin";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

const GET_OFFERS = gql`
  query($updatedBeforeThan: PaginatedInput) {
    getOffers(updatedBeforeThan: $updatedBeforeThan) {
      results {
        uuid
      }
      shouldFetchMore
    }
  }
`;

describe("getOffers", () => {
  beforeAll(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
  });

  describe("when offers exists", () => {
    let offer1: Offer;
    let offer2: Offer;
    const createOffers = async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const career1 = await CareerGenerator.instance();
      const career2 = await CareerGenerator.instance();
      offer1 = await OfferRepository.create({
        ...OfferGenerator.data.withObligatoryData({ companyUuid }),
        careers: [{ careerCode: career1.code }]
      });
      offer2 = await OfferRepository.create({
        ...OfferGenerator.data.withObligatoryData({ companyUuid }),
        careers: [{ careerCode: career2.code }]
      });
    };

    beforeAll(() => createOffers());

    it("returns two offers if two offers were created", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const { data } = await apolloClient.query({ query: GET_OFFERS });
      expect(data!.getOffers.results).toHaveLength(2);
      expect(data!.getOffers.shouldFetchMore).toEqual(false);
    });

    it("returns two offers sorted by updatedAt", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const { data } = await apolloClient.query({ query: GET_OFFERS });
      expect(data!.getOffers.results).toMatchObject([{ uuid: offer2.uuid }, { uuid: offer1.uuid }]);
      expect(data!.getOffers.shouldFetchMore).toEqual(false);
    });

    it("filters by updatedAt", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const { data } = await apolloClient.query({
        query: GET_OFFERS,
        variables: {
          updatedBeforeThan: {
            dateTime: offer2.updatedAt.toISOString(),
            uuid: offer2.uuid
          }
        }
      });
      expect(data!.getOffers.results).toMatchObject([{ uuid: offer1.uuid }]);
      expect(data!.getOffers.shouldFetchMore).toEqual(false);
    });

    it("filters by updatedAt even when it does not coincide with createdAt", async () => {
      offer1.title = "something";
      await offer1.save();
      const { apolloClient } = await TestClientGenerator.admin();
      const { data } = await apolloClient.query({
        query: GET_OFFERS,
        variables: {
          updatedBeforeThan: {
            dateTime: offer1.updatedAt.toISOString(),
            uuid: offer1.uuid
          }
        }
      });
      expect(data!.getOffers.results).toMatchObject([{ uuid: offer2.uuid }]);
      expect(data!.getOffers.shouldFetchMore).toEqual(false);
    });

    describe("pagination", () => {
      let newOffersByDescUpdatedAt: Offer[] = [];

      beforeAll(async () => {
        for (const _ of range(15)) {
          newOffersByDescUpdatedAt.push(
            await OfferRepository.create(
              OfferGenerator.data.withObligatoryData({
                companyUuid: offer1.companyUuid
              })
            )
          );
        }
        newOffersByDescUpdatedAt = newOffersByDescUpdatedAt.sort(offer => -offer.updatedAt);
      });

      it("gets the latest 10 offers", async () => {
        offer1.title = "something different";
        await offer1.save();
        const { apolloClient } = await TestClientGenerator.admin();

        const itemsPerPage = 10;
        mockItemsPerPage(itemsPerPage);
        const { data } = await apolloClient.query({ query: GET_OFFERS });
        expect(data!.getOffers.results.map(offer => offer.uuid)).toEqual([
          offer1.uuid,
          ...newOffersByDescUpdatedAt.slice(0, itemsPerPage - 1).map(offer => offer.uuid)
        ]);
        expect(data!.getOffers.shouldFetchMore).toEqual(true);
      });

      it("gets the next 3 offers", async () => {
        const offersByDescUpdatedAt = [offer1, ...newOffersByDescUpdatedAt].sort(
          offer => offer.updatedAt
        );
        const { apolloClient } = await TestClientGenerator.admin();

        const itemsPerPage = 3;
        const lastOfferIndex = 9;
        mockItemsPerPage(itemsPerPage);
        const lastOffer = offersByDescUpdatedAt[lastOfferIndex];
        const { data } = await apolloClient.query({
          query: GET_OFFERS,
          variables: {
            updatedBeforeThan: {
              dateTime: lastOffer.updatedAt.toISOString(),
              uuid: lastOffer.uuid
            }
          }
        });
        expect(data!.getOffers.results.map(offer => offer.uuid)).toEqual(
          offersByDescUpdatedAt
            .slice(lastOfferIndex + 1, lastOfferIndex + 1 + itemsPerPage)
            .map(offer => offer.uuid)
        );
        expect(data!.getOffers.shouldFetchMore).toEqual(true);
      });
    });
  });

  describe("when no offers exists", () => {
    beforeEach(() =>
      Promise.all([
        CompanyRepository.truncate(),
        CareerRepository.truncate(),
        UserRepository.truncate()
      ])
    );

    it("returns no offers when no offers were created", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const { data, errors } = await apolloClient.query({ query: GET_OFFERS });

      expect(errors).toBeUndefined();
      expect(data!.getOffers.results).toHaveLength(0);
      expect(data!.getOffers.shouldFetchMore).toEqual(false);
    });
  });

  it("returns an error when the user is from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await apolloClient.query({ query: GET_OFFERS });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns an error when the user is an applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await apolloClient.query({ query: GET_OFFERS });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns an error when the user is a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: {
        approvalStatus: ApprovalStatus.rejected,
        admin: await AdminGenerator.instance({ secretary: Secretary.extension })
      }
    });
    const { errors } = await apolloClient.query({ query: GET_OFFERS });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns an error when the user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await apolloClient.query({ query: GET_OFFERS });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });
});
