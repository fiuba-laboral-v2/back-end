import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";
import { IGetOffers } from "$graphql/Offer/Queries/getOffers";

import { UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { ApplicantType } from "$models/Applicant";
import { Admin, Company, Offer } from "$models";

import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { OfferRepository, OfferStatus } from "$models/Offer";
import { UserRepository } from "$models/User";

import { AdminGenerator } from "$generators/Admin";
import { CareerGenerator } from "$generators/Career";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { TestClientGenerator } from "$generators/TestClient";
import { range } from "lodash";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

const GET_OFFERS = gql`
  query(
    $updatedBeforeThan: PaginatedInput
    $companyName: String
    $businessSector: String
    $studentsStatus: OfferStatus
    $graduatesStatus: OfferStatus
    $title: String
  ) {
    getOffers(
      updatedBeforeThan: $updatedBeforeThan
      companyName: $companyName
      businessSector: $businessSector
      studentsStatus: $studentsStatus
      graduatesStatus: $graduatesStatus
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
    let rejectedForStudents: Offer;
    let approvedForGraduates: Offer;
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

      rejectedForStudents = await OfferRepository.create({
        ...OfferGenerator.data.withObligatoryData({ companyUuid }),
        title: "Java junior",
        targetApplicantType: ApplicantType.student,
        careers: [{ careerCode: career1.code }]
      });
      rejectedForStudents.updateStatus(extensionAdmin, ApprovalStatus.rejected, 15);
      rejectedForStudents.updateStatus(graduadosAdmin, ApprovalStatus.rejected, 15);
      OfferRepository.save(rejectedForStudents);

      approvedForGraduates = await OfferRepository.create({
        ...OfferGenerator.data.withObligatoryData({ companyUuid }),
        title: "Ruby junior",
        targetApplicantType: ApplicantType.graduate,
        careers: [{ careerCode: career2.code }]
      });
      approvedForGraduates.updateStatus(extensionAdmin, ApprovalStatus.approved, 15);
      approvedForGraduates.updateStatus(graduadosAdmin, ApprovalStatus.approved, 15);
      OfferRepository.save(approvedForGraduates);

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
      expect(uuids).toEqual([approvedForGraduates.uuid]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns all offers that have part of the title in common", async () => {
      const { errors, data } = await getOffers(apolloClient, { title: "junior" });
      expect(errors).toBeUndefined();

      const { results, shouldFetchMore } = data!.getOffers;
      const uuids = results.map(({ uuid }) => uuid);
      expect(uuids).toEqual([approvedForGraduates.uuid, rejectedForStudents.uuid]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns no offers if the title is unknown", async () => {
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
      expect(uuids).toEqual([approvedForGraduates.uuid, rejectedForStudents.uuid]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns rejected offers for students", async () => {
      const studentsStatus = OfferStatus.rejected;
      const { errors, data } = await getOffers(apolloClient, { studentsStatus });
      expect(errors).toBeUndefined();
      const { results, shouldFetchMore } = data!.getOffers;
      const uuids = results.map(({ uuid }) => uuid);
      expect(uuids).toEqual([rejectedForStudents.uuid]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns approved offers for graduates", async () => {
      const graduatesStatus = OfferStatus.approved;
      const { errors, data } = await getOffers(apolloClient, { graduatesStatus });
      expect(errors).toBeUndefined();
      const { results, shouldFetchMore } = data!.getOffers;
      const uuids = results.map(({ uuid }) => uuid);
      expect(uuids).toEqual([approvedForGraduates.uuid]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns offers by businessSector", async () => {
      const businessSector = company.businessSector;
      const { errors, data } = await getOffers(apolloClient, { businessSector });
      expect(errors).toBeUndefined();
      const { results, shouldFetchMore } = data!.getOffers;
      const uuids = results.map(({ uuid }) => uuid);
      expect(uuids).toEqual([approvedForGraduates.uuid, rejectedForStudents.uuid]);
      expect(shouldFetchMore).toBe(false);
    });

    it("returns two offers sorted by updatedAt", async () => {
      const { data } = await getOffers(apolloClient);
      const { results, shouldFetchMore } = data!.getOffers;
      expect(results).toEqual([
        { uuid: approvedForGraduates.uuid },
        { uuid: rejectedForStudents.uuid }
      ]);
      expect(shouldFetchMore).toEqual(false);
    });

    it("filters by updatedAt", async () => {
      const { data } = await apolloClient.query({
        query: GET_OFFERS,
        variables: {
          updatedBeforeThan: {
            dateTime: approvedForGraduates.updatedAt.toISOString(),
            uuid: approvedForGraduates.uuid
          }
        }
      });
      const { results, shouldFetchMore } = data!.getOffers;
      expect(results).toEqual([{ uuid: rejectedForStudents.uuid }]);
      expect(shouldFetchMore).toEqual(false);
    });

    it("filters by updatedAt even when it does not coincide with createdAt", async () => {
      rejectedForStudents.title = "something";
      await OfferRepository.save(rejectedForStudents);
      const { data } = await apolloClient.query({
        query: GET_OFFERS,
        variables: {
          updatedBeforeThan: {
            dateTime: rejectedForStudents.updatedAt.toISOString(),
            uuid: rejectedForStudents.uuid
          }
        }
      });
      const { results, shouldFetchMore } = data!.getOffers;
      expect(results).toEqual([{ uuid: approvedForGraduates.uuid }]);
      expect(shouldFetchMore).toEqual(false);
    });

    describe("pagination", () => {
      let newOffersByDescUpdatedAt: Offer[] = [];

      beforeAll(async () => {
        for (const _ of range(15)) {
          newOffersByDescUpdatedAt.push(
            await OfferRepository.create(
              OfferGenerator.data.withObligatoryData({
                companyUuid: rejectedForStudents.companyUuid
              })
            )
          );
        }
        newOffersByDescUpdatedAt = newOffersByDescUpdatedAt.sort(offer => -offer.updatedAt);
      });

      it("gets the latest 10 offers", async () => {
        rejectedForStudents.title = "something different";
        await OfferRepository.save(rejectedForStudents);

        const itemsPerPage = 10;
        mockItemsPerPage(itemsPerPage);
        const { data } = await getOffers(apolloClient);
        const { results, shouldFetchMore } = data!.getOffers;

        expect(results.map(offer => offer.uuid)).toEqual([
          rejectedForStudents.uuid,
          ...newOffersByDescUpdatedAt.slice(0, itemsPerPage - 1).map(offer => offer.uuid)
        ]);
        expect(shouldFetchMore).toEqual(true);
      });

      it("gets the next 3 offers", async () => {
        const offersByDescUpdatedAt = [rejectedForStudents, ...newOffersByDescUpdatedAt].sort(
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
