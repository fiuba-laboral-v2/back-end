import { gql } from "apollo-server";
import Database from "../../../../src/config/Database";
import { client } from "../../ApolloTestClient";

import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { UserRepository } from "../../../../src/models/User";

import { CareerGenerator, TCareerGenerator } from "../../../generators/Career";
import { CompanyGenerator, TCompanyGenerator } from "../../../generators/Company";
import { OfferGenerator, TOfferGenerator } from "../../../generators/Offer";
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
  let offers: TOfferGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    careers = CareerGenerator.instance();
    companies = CompanyGenerator.withMinimumData();
    offers = await OfferGenerator.instance.withObligatoryData();
  });

  afterAll(() => Database.close());

  describe("when offers exists", () => {
    let offer1;
    let offer2;
    const createOffers = async (companyUuid: string) => {
      const { uuid } = await companies.next().value;
      const career1 = await careers.next().value;
      const career2 = await careers.next().value;
      offer1 = await offers.next({ companyUuid, careers: [{ careerCode: career1.code }] }).value;
      offer2 = await offers.next({ companyUuid, careers: [{ careerCode: career2.code }] }).value;
      await offers.next({ companyUuid: uuid, careers: [{ careerCode: career1.code }] }).value;
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
      const apolloClient = client.loggedOut();
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
