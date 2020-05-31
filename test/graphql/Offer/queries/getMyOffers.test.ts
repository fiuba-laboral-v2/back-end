import { gql } from "apollo-server";
import Database from "../../../../src/config/Database";
import { client } from "../../ApolloTestClient";

import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { OfferRepository } from "../../../../src/models/Offer";
import { UserRepository } from "../../../../src/models/User";

import { CareerGenerator, TCareerGenerator } from "../../../generators/Career";
import { CompanyGenerator, TCompanyGenerator } from "../../../generators/Company";
import { OfferMocks } from "../../../models/Offer/mocks";
import { testClientFactory } from "../../../mocks/testClientFactory";

const GET_MY_OFFERS = gql`
  query {
    getMyOffers {
      uuid
    }
  }
`;

describe("getMyOffers", () => {
  let careers: TCareerGenerator;
  let companies: TCompanyGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    careers = CareerGenerator.instance();
    companies = CompanyGenerator.withMinimumData();
  });

  afterAll(() => Database.close());

  describe("when offers exists", () => {
    let offer1;
    let offer2;
    const createOffers = async (companyUuid: string) => {
      const { uuid } = await companies.next().value;
      const career1 = await careers.next().value;
      const career2 = await careers.next().value;
      const offerAttributes1 = OfferMocks.withOneCareer(companyUuid, career1.code);
      const offerAttributes2 = OfferMocks.withOneCareer(companyUuid, career2.code);
      const offerAttributes3 = OfferMocks.withOneCareer(uuid, career1.code);
      offer1 = await OfferRepository.create(offerAttributes1);
      offer2 = await OfferRepository.create(offerAttributes2);
      await OfferRepository.create(offerAttributes3);
    };

    it("returns only the offers that the company made", async () => {
      const { company, apolloClient } = await testClientFactory.company();
      await createOffers(company.uuid);
      const { data, errors } = await apolloClient.query({ query: GET_MY_OFFERS });
      expect(errors).toBeUndefined();
      expect(data!.getMyOffers).toHaveLength(2);
      expect(data!.getMyOffers).toMatchObject(
        [
          { uuid: offer1.uuid },
          { uuid: offer2.uuid }
        ]
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
      const { apolloClient } = await testClientFactory.company();
      const { data, errors } = await apolloClient.query({ query: GET_MY_OFFERS });

      expect(errors).toBeUndefined();
      expect(data!.getMyOffers).toHaveLength(0);
    });
  });

  describe("Errors", () => {
    it("should return an error if there is no current user", async () => {
      const apolloClient = client.loggedOut;
      const { errors } = await apolloClient.query({
        query: GET_MY_OFFERS
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("should return an error if current user is not a companyUser", async () => {
      const { apolloClient } = await testClientFactory.user();
      const { errors } = await apolloClient.query({
        query: GET_MY_OFFERS
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});
