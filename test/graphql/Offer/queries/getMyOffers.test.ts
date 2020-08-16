import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin } from "$models";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { OfferRepository } from "$models/Offer";

import { CareerGenerator } from "$generators/Career";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator, TOfferGenerator } from "$generators/Offer";
import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";
import { Secretary } from "$models/Admin";

const GET_MY_OFFERS = gql`
  query {
    getMyOffers {
      uuid
    }
  }
`;

describe("getMyOffers", () => {
  let offers: TOfferGenerator;
  let admin: Admin;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    offers = await OfferGenerator.instance.withObligatoryData();
    admin = await AdminGenerator.instance(Secretary.extension);
  });

  describe("when offers exists", () => {
    let offer1;
    let offer2;

    const createOffers = async (companyUuid: string) => {
      const { uuid } = await CompanyGenerator.instance.withMinimumData();
      const career1 = await CareerGenerator.instance();
      const career2 = await CareerGenerator.instance();
      offer1 = await offers.next({
        companyUuid,
        careers: [{ careerCode: career1.code }]
      }).value;
      offer2 = await offers.next({
        companyUuid,
        careers: [{ careerCode: career2.code }]
      }).value;
      await offers.next({
        companyUuid: uuid,
        careers: [{ careerCode: career1.code }]
      }).value;
    };

    it("returns only the offers that the company made", async () => {
      const { apolloClient, company } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      await createOffers(company.uuid);
      const { data, errors } = await apolloClient.query({
        query: GET_MY_OFFERS
      });
      expect(errors).toBeUndefined();
      expect(data!.getMyOffers).toHaveLength(2);
      expect(data!.getMyOffers).toMatchObject([{ uuid: offer1.uuid }, { uuid: offer2.uuid }]);
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
      expect(data!.getMyOffers).toHaveLength(0);
    });
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const { errors } = await apolloClient.query({
        query: GET_MY_OFFERS
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: AuthenticationError.name
      });
    });

    it("returns an error if current user is not a companyUser", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.query({ query: GET_MY_OFFERS });

      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if company has pending status", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.pending
        }
      });
      const { errors } = await apolloClient.query({ query: GET_MY_OFFERS });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if company has rejected status", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.rejected
        }
      });
      const { errors } = await apolloClient.query({ query: GET_MY_OFFERS });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });
  });
});
