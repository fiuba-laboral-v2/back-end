import { gql } from "apollo-server";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
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

const GET_APPROVED_OFFERS = gql`
  query($updatedBeforeThan: PaginatedInput) {
    getApprovedOffers(updatedBeforeThan: $updatedBeforeThan) {
      results {
        uuid
      }
      shouldFetchMore
    }
  }
`;

describe("getApprovedOffers", () => {
  const approvedApplicantTestClient = async (secretary: Secretary) => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: await AdminGenerator.instance({ secretary })
      }
    });
    return apolloClient;
  };

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
  });

  describe("when offers exists", () => {
    let approvedOffer1: Offer;
    let approvedOffer2: Offer;

    const createOfferWith = async (status: ApprovalStatus, secretary: Secretary) => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      return OfferGenerator.instance.updatedWithStatus({
        companyUuid,
        careers: [
          { careerCode: (await CareerGenerator.instance()).code },
          { careerCode: (await CareerGenerator.instance()).code }
        ],
        admin: await AdminGenerator.instance({ secretary }),
        secretary,
        status
      });
    };

    beforeAll(async () => {
      approvedOffer1 = await createOfferWith(ApprovalStatus.approved, Secretary.extension);
      approvedOffer2 = await createOfferWith(ApprovalStatus.approved, Secretary.graduados);
      await createOfferWith(ApprovalStatus.rejected, Secretary.extension);
      await createOfferWith(ApprovalStatus.pending, Secretary.graduados);
    });

    it("returns only the two approved offers", async () => {
      const apolloClient = await approvedApplicantTestClient(Secretary.extension);
      const { data } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
      expect(data!.getApprovedOffers.results).toHaveLength(2);
      expect(data!.getApprovedOffers.shouldFetchMore).toEqual(false);
    });

    it("returns two approved offers sorted by updatedAt", async () => {
      const apolloClient = await approvedApplicantTestClient(Secretary.graduados);
      const { data } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
      expect(data!.getApprovedOffers.results).toEqual([
        { uuid: approvedOffer2.uuid },
        { uuid: approvedOffer1.uuid }
      ]);
      expect(data!.getApprovedOffers.shouldFetchMore).toEqual(false);
    });

    it("filters by updatedAt", async () => {
      const apolloClient = await approvedApplicantTestClient(Secretary.extension);
      const { data } = await apolloClient.query({
        query: GET_APPROVED_OFFERS,
        variables: {
          updatedBeforeThan: {
            dateTime: approvedOffer2.updatedAt.toISOString(),
            uuid: approvedOffer2.uuid
          }
        }
      });
      expect(data!.getApprovedOffers.results).toEqual([{ uuid: approvedOffer1.uuid }]);
      expect(data!.getApprovedOffers.shouldFetchMore).toEqual(false);
    });

    it("filters by updatedAt even when it does not coincide with createdAt", async () => {
      approvedOffer1.title = "new title";
      await approvedOffer1.save();
      const apolloClient = await approvedApplicantTestClient(Secretary.extension);
      const { data } = await apolloClient.query({
        query: GET_APPROVED_OFFERS,
        variables: {
          updatedBeforeThan: {
            dateTime: approvedOffer1.updatedAt.toISOString(),
            uuid: approvedOffer1.uuid
          }
        }
      });
      expect(data!.getApprovedOffers.results).toEqual([{ uuid: approvedOffer2.uuid }]);
      expect(data!.getApprovedOffers.shouldFetchMore).toEqual(false);
    });
  });

  describe("pagination", () => {
    let newOffersByDescUpdatedAt: Offer[] = [];

    beforeAll(async () => {
      await CompanyRepository.truncate();
      await CareerRepository.truncate();
      await UserRepository.truncate();

      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();

      for (const _ of range(15)) {
        newOffersByDescUpdatedAt.push(
          await OfferGenerator.instance.updatedWithStatus({
            companyUuid,
            status: ApprovalStatus.approved,
            secretary: Secretary.extension,
            admin: await AdminGenerator.instance({ secretary: Secretary.extension })
          })
        );
      }
      newOffersByDescUpdatedAt = newOffersByDescUpdatedAt.sort(offer => -offer.updatedAt);
    });

    it("gets the latest 10 offers", async () => {
      const apolloClient = await approvedApplicantTestClient(Secretary.graduados);
      const itemsPerPage = 10;
      mockItemsPerPage(itemsPerPage);
      const { data } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
      expect(data!.getApprovedOffers.results.map(offer => offer.uuid)).toEqual([
        ...newOffersByDescUpdatedAt.slice(0, itemsPerPage).map(offer => offer.uuid)
      ]);
      expect(data!.getApprovedOffers.shouldFetchMore).toEqual(true);
    });

    it("gets the next 3 offers", async () => {
      const apolloClient = await approvedApplicantTestClient(Secretary.graduados);
      const itemsPerPage = 3;
      const lastOfferIndex = 9;
      mockItemsPerPage(itemsPerPage);
      const lastOffer = newOffersByDescUpdatedAt[lastOfferIndex];
      const { data } = await apolloClient.query({
        query: GET_APPROVED_OFFERS,
        variables: {
          updatedBeforeThan: {
            dateTime: lastOffer.updatedAt.toISOString(),
            uuid: lastOffer.uuid
          }
        }
      });
      expect(data!.getApprovedOffers.results.map(offer => offer.uuid)).toEqual(
        newOffersByDescUpdatedAt
          .slice(lastOfferIndex + 1, lastOfferIndex + 1 + itemsPerPage)
          .map(offer => offer.uuid)
      );
      expect(data!.getApprovedOffers.shouldFetchMore).toEqual(true);
    });
  });

  it("returns no offers when no offers were created", async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    const apolloClient = await approvedApplicantTestClient(Secretary.extension);
    const { data, errors } = await apolloClient.query({ query: GET_APPROVED_OFFERS });

    expect(errors).toBeUndefined();
    expect(data!.getApprovedOffers.results).toHaveLength(0);
    expect(data!.getApprovedOffers.shouldFetchMore).toEqual(false);
  });

  it("returns an error when the user is from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns an error when the user is an admin", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
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
    const { errors } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns an error when the user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });
});
