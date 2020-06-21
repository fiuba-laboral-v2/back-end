import { gql } from "apollo-server";
import Database from "../../../../src/config/Database";
import { client } from "../../ApolloTestClient";

import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import { Admin } from "../../../../src/models/Admin";
import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { UserRepository } from "../../../../src/models/User";
import { OfferRepository } from "../../../../src/models/Offer";

import { CareerGenerator, TCareerGenerator } from "../../../generators/Career";
import { CompanyGenerator, TCompanyGenerator } from "../../../generators/Company";
import { OfferGenerator, TOfferGenerator } from "../../../generators/Offer";
import { AdminGenerator } from "../../../generators/Admin";
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
  let admin: Admin;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    careers = CareerGenerator.instance();
    companies = CompanyGenerator.instance.withMinimumData();
    offers = await OfferGenerator.instance.withObligatoryData();
    admin = await AdminGenerator.instance().next().value;
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
      const { apolloClient, company } = await testClientFactory.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
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
    it("returns no offers when no offers were created", async () => {
      await OfferRepository.truncate();
      const { apolloClient } = await testClientFactory.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      const { data, errors } = await apolloClient.query({ query: GET_MY_OFFERS });

      expect(errors).toBeUndefined();
      expect(data!.getMyOffers).toHaveLength(0);
    });
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const { errors } = await apolloClient.query({
        query: GET_MY_OFFERS
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("returns an error if current user is not a companyUser", async () => {
      const { apolloClient } = await testClientFactory.user();
      const { errors } = await apolloClient.query({ query: GET_MY_OFFERS });

      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if company has pending status", async () => {
      const { apolloClient } = await testClientFactory.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.pending
        }
      });
      const { errors } = await apolloClient.query({ query: GET_MY_OFFERS });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if company has rejected status", async () => {
      const { apolloClient } = await testClientFactory.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.rejected
        }
      });
      const { errors } = await apolloClient.query({ query: GET_MY_OFFERS });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});
