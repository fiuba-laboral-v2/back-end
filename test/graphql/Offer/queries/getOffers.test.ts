import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";
import { IGetOffers } from "$graphql/Offer/Queries/getOffers";

import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { OfferRepository } from "$models/Offer";
import { UserRepository } from "$models/User";

import { AdminGenerator } from "$generators/Admin";
import { CareerGenerator } from "$generators/Career";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { TestClientGenerator } from "$generators/TestClient";
import { UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { range } from "lodash";
import { Admin, Company, Offer } from "$models";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { Secretary } from "$models/Admin";

const GET_OFFERS = gql`
  query(
    $updatedBeforeThan: PaginatedInput
    $companyName: String
    $businessSector: String
    $approvalStatus: ApprovalStatus
    $title: String
  ) {
    getOffers(
      updatedBeforeThan: $updatedBeforeThan
      companyName: $companyName
      businessSector: $businessSector
      approvalStatus: $approvalStatus
      title: $title
    ) {
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

  const getOffers = (apolloClient: TestClient, variables?: IGetOffers) =>
    apolloClient.query({ query: GET_OFFERS, variables });

  describe("when offers exists", () => {
    let javaJunior: Offer;
    let rubyJunior: Offer;
    let company: Company;
    let apolloClient: TestClient;
    let extensionAdmin: Admin;
    let graduadosAdmin: Admin;

    beforeAll(async () => {
      extensionAdmin = await AdminGenerator.extension();
      graduadosAdmin = await AdminGenerator.graduados();

      company = await CompanyGenerator.instance.withMinimumData();
      const companyUuid = company.uuid;

      const career1 = await CareerGenerator.instance();
      const career2 = await CareerGenerator.instance();

      javaJunior = await OfferRepository.create({
        ...OfferGenerator.data.withObligatoryData({ companyUuid }),
        title: "Java junior",
        careers: [{ careerCode: career1.code }]
      });
      javaJunior.updateStatus(extensionAdmin, ApprovalStatus.rejected, 15);
      javaJunior.updateStatus(graduadosAdmin, ApprovalStatus.rejected, 15);
      OfferRepository.save(javaJunior);

      rubyJunior = await OfferRepository.create({
        ...OfferGenerator.data.withObligatoryData({ companyUuid }),
        title: "Ruby junior",
        careers: [{ careerCode: career2.code }]
      });
      rubyJunior.updateStatus(extensionAdmin, ApprovalStatus.approved, 15);
      rubyJunior.updateStatus(graduadosAdmin, ApprovalStatus.approved, 15);
      OfferRepository.save(rubyJunior);

      const adminClient = await TestClientGenerator.admin({ secretary: Secretary.graduados });
      apolloClient = adminClient.apolloClient;
    });

    it("returns two offers if two offers were created", async () => {
      const { data } = await getOffers(apolloClient);
      const { results, shouldFetchMore } = data!.getOffers;
      expect(results).toHaveLength(2);
      expect(shouldFetchMore).toEqual(false);
    });

    it("returns offers by title", async () => {
      const { data } = await getOffers(apolloClient, { title: "ruby junior" });
      const { results, shouldFetchMore } = data!.getOffers;
      const uuids = results.map(({ uuid }) => uuid);
      expect(uuids).toEqual([rubyJunior.uuid]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns all offers that have part of the title in common", async () => {
      const { errors, data } = await getOffers(apolloClient, { title: "junior" });
      expect(errors).toBeUndefined();

      const { results, shouldFetchMore } = data!.getOffers;
      const uuids = results.map(({ uuid }) => uuid);
      expect(uuids).toEqual([rubyJunior.uuid, javaJunior.uuid]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns all offers if the title is unknown", async () => {
      const { errors, data } = await getOffers(apolloClient, { title: " UNKnOWN" });
      expect(errors).toBeUndefined();
      const { results, shouldFetchMore } = data!.getOffers;
      expect(results).toEqual([]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns offers by the companyName", async () => {
      const companyName = company.companyName;
      const { errors, data } = await getOffers(apolloClient, { companyName });
      expect(errors).toBeUndefined();
      const { results, shouldFetchMore } = data!.getOffers;
      const uuids = results.map(({ uuid }) => uuid);
      expect(uuids).toEqual([rubyJunior.uuid, javaJunior.uuid]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns approved offers for any target", async () => {
      const approvalStatus = ApprovalStatus.approved;
      const { errors, data } = await getOffers(apolloClient, { approvalStatus });
      expect(errors).toBeUndefined();
      const { results, shouldFetchMore } = data!.getOffers;
      const uuids = results.map(({ uuid }) => uuid);
      expect(uuids).toEqual([rubyJunior.uuid]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns rejected offers for any target", async () => {
      const approvalStatus = ApprovalStatus.rejected;
      const { errors, data } = await getOffers(apolloClient, { approvalStatus });
      expect(errors).toBeUndefined();
      const { results, shouldFetchMore } = data!.getOffers;
      const uuids = results.map(({ uuid }) => uuid);
      expect(uuids).toEqual([javaJunior.uuid]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns no offers if no offer is in pending status", async () => {
      const approvalStatus = ApprovalStatus.pending;
      const { errors, data } = await getOffers(apolloClient, { approvalStatus });
      expect(errors).toBeUndefined();
      const { results, shouldFetchMore } = data!.getOffers;
      expect(results).toEqual([]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns offers by businessSector", async () => {
      const businessSector = company.businessSector;
      const { errors, data } = await getOffers(apolloClient, { businessSector });
      expect(errors).toBeUndefined();
      const { results, shouldFetchMore } = data!.getOffers;
      const uuids = results.map(({ uuid }) => uuid);
      expect(uuids).toEqual([rubyJunior.uuid, javaJunior.uuid]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns two offers sorted by updatedAt", async () => {
      const { data } = await getOffers(apolloClient);
      const { results, shouldFetchMore } = data!.getOffers;
      expect(results).toEqual([{ uuid: rubyJunior.uuid }, { uuid: javaJunior.uuid }]);
      expect(shouldFetchMore).toEqual(false);
    });

    it("filters by updatedAt", async () => {
      const { data } = await apolloClient.query({
        query: GET_OFFERS,
        variables: {
          updatedBeforeThan: {
            dateTime: rubyJunior.updatedAt.toISOString(),
            uuid: rubyJunior.uuid
          }
        }
      });
      const { results, shouldFetchMore } = data!.getOffers;
      expect(results).toEqual([{ uuid: javaJunior.uuid }]);
      expect(shouldFetchMore).toEqual(false);
    });

    it("filters by updatedAt even when it does not coincide with createdAt", async () => {
      javaJunior.title = "something";
      await OfferRepository.save(javaJunior);
      const { data } = await apolloClient.query({
        query: GET_OFFERS,
        variables: {
          updatedBeforeThan: {
            dateTime: javaJunior.updatedAt.toISOString(),
            uuid: javaJunior.uuid
          }
        }
      });
      const { results, shouldFetchMore } = data!.getOffers;
      expect(results).toEqual([{ uuid: rubyJunior.uuid }]);
      expect(shouldFetchMore).toEqual(false);
    });

    describe("pagination", () => {
      let newOffersByDescUpdatedAt: Offer[] = [];

      beforeAll(async () => {
        for (const _ of range(15)) {
          newOffersByDescUpdatedAt.push(
            await OfferRepository.create(
              OfferGenerator.data.withObligatoryData({
                companyUuid: javaJunior.companyUuid
              })
            )
          );
        }
        newOffersByDescUpdatedAt = newOffersByDescUpdatedAt.sort(offer => -offer.updatedAt);
      });

      it("gets the latest 10 offers", async () => {
        javaJunior.title = "something different";
        await OfferRepository.save(javaJunior);

        const itemsPerPage = 10;
        mockItemsPerPage(itemsPerPage);
        const { data } = await getOffers(apolloClient);
        const { results, shouldFetchMore } = data!.getOffers;

        expect(results.map(offer => offer.uuid)).toEqual([
          javaJunior.uuid,
          ...newOffersByDescUpdatedAt.slice(0, itemsPerPage - 1).map(offer => offer.uuid)
        ]);
        expect(shouldFetchMore).toEqual(true);
      });

      it("gets the next 3 offers", async () => {
        const offersByDescUpdatedAt = [javaJunior, ...newOffersByDescUpdatedAt].sort(
          offer => offer.updatedAt
        );

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
        const { results, shouldFetchMore } = data!.getOffers;

        expect(results.map(offer => offer.uuid)).toEqual(
          offersByDescUpdatedAt
            .slice(lastOfferIndex + 1, lastOfferIndex + 1 + itemsPerPage)
            .map(offer => offer.uuid)
        );
        expect(shouldFetchMore).toEqual(true);
      });
    });
  });

  describe("when no offers exists", () => {
    beforeAll(async () => {
      await CompanyRepository.truncate();
      await CareerRepository.truncate();
      await UserRepository.truncate();
    });

    it("returns no offers when no offers were created", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const { data, errors } = await getOffers(apolloClient);

      expect(errors).toBeUndefined();
      const { results, shouldFetchMore } = data!.getOffers;
      expect(results).toHaveLength(0);
      expect(shouldFetchMore).toEqual(false);
    });
  });

  it("returns an error when the user is from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await getOffers(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error when the user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.pending
    });
    const { errors } = await getOffers(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error when the user is a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.rejected
    });
    const { errors } = await getOffers(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error when the user is an approved applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved
    });
    const { errors } = await getOffers(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
