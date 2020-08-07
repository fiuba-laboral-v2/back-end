import { gql } from "apollo-server";

import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { OfferRepository } from "$models/Offer";
import { UserRepository } from "$models/User";

import { CareerGenerator, TCareerGenerator } from "$generators/Career";
import { CompanyGenerator, TCompanyGenerator } from "$generators/Company";
import { OfferGenerator, TOfferDataGenerator } from "$generators/Offer";
import { testClientFactory } from "$mocks/testClientFactory";
import { UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ExtensionAdminGenerator, TAdminGenerator } from "$generators/Admin";
import { range } from "lodash";
import { Offer } from "$models";

const GET_OFFERS = gql`
  query ($updatedBeforeThan: DateTime) {
    getOffers(updatedBeforeThan: $updatedBeforeThan) {
      uuid
    }
  }
`;

describe("getOffers", () => {
  let careers: TCareerGenerator;
  let companies: TCompanyGenerator;
  let offersData: TOfferDataGenerator;
  let admins: TAdminGenerator;

  const approvedApplicantTestClient = async () => {
    const { apolloClient } = await testClientFactory.applicant({
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: await admins.next().value
      }
    });
    return apolloClient;
  };

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    careers = CareerGenerator.instance();
    companies = CompanyGenerator.instance.withMinimumData();
    offersData = OfferGenerator.data.withObligatoryData();
    admins = ExtensionAdminGenerator.instance();
  });

  describe("when offers exists", () => {
    let offer1: Offer;
    let offer2: Offer;
    const createOffers = async () => {
      const { uuid: companyUuid } = await companies.next().value;
      const career1 = await careers.next().value;
      const career2 = await careers.next().value;
      offer1 = await OfferRepository.create({
        ...offersData.next({ companyUuid }).value,
        careers: [{ careerCode: career1.code }]
      });
      offer2 = await OfferRepository.create({
        ...offersData.next({ companyUuid }).value,
        careers: [{ careerCode: career2.code }]
      });
    };

    beforeAll(() => createOffers());

    it("returns two offers if two offers were created", async () => {
      const apolloClient = await approvedApplicantTestClient();
      const { data } = await apolloClient.query({ query: GET_OFFERS });
      expect(data!.getOffers).toHaveLength(2);
    });

    it("returns two offers sorted by updatedAt", async () => {
      const apolloClient = await approvedApplicantTestClient();
      const { data } = await apolloClient.query({ query: GET_OFFERS });
      expect(data!.getOffers).toMatchObject(
        [
          { uuid: offer2.uuid },
          { uuid: offer1.uuid }
        ]
      );
    });

    it("filters by updatedAt", async () => {
      const apolloClient = await approvedApplicantTestClient();
      const { data } = await apolloClient.query({
        query: GET_OFFERS,
        variables: {
          updatedBeforeThan: offer2.updatedAt.toISOString()
        }
      });
      expect(data!.getOffers).toMatchObject(
        [
          { uuid: offer1.uuid }
        ]
      );
    });

    it("filters by updatedAt even when it does not coincide with createdAt", async () => {
      offer1.title = "something";
      await offer1.save();
      const apolloClient = await approvedApplicantTestClient();
      const { data } = await apolloClient.query({
        query: GET_OFFERS,
        variables: {
          updatedBeforeThan: offer1.updatedAt.toISOString()
        }
      });
      expect(data!.getOffers).toMatchObject(
        [
          { uuid: offer2.uuid }
        ]
      );
    });

    it("gets the latest 10 offers", async () => {
      const newOffers: Offer[] = [];
      for (const _ of range(15)) {
        newOffers.push(
          await OfferRepository.create(offersData.next({
            companyUuid: offer1.companyUuid
          }).value)
        );
      }
      offer1.title = "something different";
      await offer1.save();
      const apolloClient = await approvedApplicantTestClient();
      const { data } = await apolloClient.query({ query: GET_OFFERS });
      expect(data!.getOffers.map(offer => offer.uuid)).toEqual(
        [offer1.uuid, ...newOffers.slice(-9).map(offer => offer.uuid).reverse()]
      );
    });
  });

  describe("when no offers exists", () => {
    beforeEach(() => Promise.all([
      CompanyRepository.truncate(),
      CareerRepository.truncate(),
      UserRepository.truncate()
    ]));

    it("returns no offers when no offers were created", async () => {
      const apolloClient = await approvedApplicantTestClient();
      const { data, errors } = await apolloClient.query({ query: GET_OFFERS });

      expect(errors).toBeUndefined();
      expect(data!.getOffers).toHaveLength(0);
    });
  });

  it("returns an error when the user is from a company", async () => {
    const { apolloClient } = await testClientFactory.company();
    const { errors } = await apolloClient.query({ query: GET_OFFERS });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("returns an error when the user is an admin", async () => {
    const { apolloClient } = await testClientFactory.admin();
    const { errors } = await apolloClient.query({ query: GET_OFFERS });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("returns an error when the user is a rejected applicant", async () => {
    const { apolloClient } = await testClientFactory.applicant({
      status: {
        approvalStatus: ApprovalStatus.rejected,
        admin: await admins.next().value
      }
    });
    const { errors } = await apolloClient.query({ query: GET_OFFERS });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("returns an error when the user is a pending applicant", async () => {
    const { apolloClient } = await testClientFactory.applicant();
    const { errors } = await apolloClient.query({ query: GET_OFFERS });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });
});
