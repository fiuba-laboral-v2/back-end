import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { OfferRepository } from "../../../../src/models/Offer";
import { JobApplicationRepository } from "../../../../src/models/JobApplication";
import { UserRepository } from "../../../../src/models/User";

import { OfferNotFound } from "../../../../src/models/Offer/Errors";
import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

import { careerMocks } from "../../../models/Career/mocks";
import { OfferMocks } from "../../../models/Offer/mocks";
import { userFactory } from "../../../mocks/user";
import { testClientFactory } from "../../../mocks/testClientFactory";

const GET_OFFER_BY_UUID = gql`
  query ($uuid: ID!) {
    getOfferByUuid(uuid: $uuid) {
      uuid
      title
      description
      hoursPerDay
      minimumSalary
      maximumSalary
      createdAt
      sections {
          uuid
          title
          text
          displayOrder
      }
      careers {
          code
          description
          credits
      }
      company {
        cuit
        companyName
        slogan
        description
        logo
        website
        email
        phoneNumbers
        photos
      }
    }
  }
`;

const GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION = gql`
    query ($uuid: ID!) {
        getOfferByUuid(uuid: $uuid) {
            uuid
            hasApplied
        }
    }
`;

describe("getOfferByUuid", () => {
  beforeAll(() => {
    Database.setConnection();
    return Promise.all([
      CompanyRepository.truncate(),
      CareerRepository.truncate(),
      UserRepository.truncate()
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      CompanyRepository.truncate(),
      CareerRepository.truncate(),
      UserRepository.truncate()
    ]);
    return Database.close();
  });

  const createOffer = async company => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const offer = await OfferRepository.create(
      OfferMocks.withOneCareerAndOneSection(company.uuid, career.code)
    );
    return { offer, career, company };
  };

  describe("when and offer exists", () => {
    it("finds an offer by uuid", async () => {
      const { company, apolloClient } = await testClientFactory.company();
      const { offer, career } = await createOffer(company);
      const { data, errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID,
        variables: { uuid: offer.uuid }
      });
      expect(errors).toBeUndefined();
      expect(data!.getOfferByUuid).toMatchObject(
        {
          uuid: offer.uuid,
          title: offer.title,
          description: offer.description,
          hoursPerDay: offer.hoursPerDay,
          minimumSalary: offer.minimumSalary,
          maximumSalary: offer.maximumSalary,
          createdAt: offer.createdAt.getTime().toString(),
          careers: [
            {
              code: career.code,
              description: career.description,
              credits: career.credits
            }
          ],
          sections: (await offer.getSections()).map(section => (
            {
              uuid: section.uuid,
              title: section.title,
              text: section.text,
              displayOrder: section.displayOrder
            }
          )),
          company: {
            cuit: company.cuit,
            companyName: company.companyName,
            slogan: company.slogan,
            description: company.description,
            logo: company.logo,
            website: company.website,
            email: company.email,
            phoneNumbers: await company.getPhoneNumbers(),
            photos: await company.getPhotos()
          }
        }
      );
    });

    it("finds an offer with hasApplied in true", async () => {
      const { applicant, apolloClient } = await testClientFactory.applicant();
      const company = await userFactory.company();
      const { offer } = await createOffer(company);
      await JobApplicationRepository.apply(applicant.uuid, offer);

      const { data, errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
        variables: { uuid: offer.uuid }
      });

      expect(errors).toBeUndefined();
      expect(data!.getOfferByUuid).toMatchObject(
        {
          uuid: offer.uuid,
          hasApplied: true
        }
      );
    });

    it("finds an offer with hasApplied in false", async () => {
      const { apolloClient } = await testClientFactory.applicant();
      const company = await userFactory.company();
      const { offer: { uuid } } = await createOffer(company);
      const { data, errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
        variables: { uuid: uuid }
      });
      expect(errors).toBeUndefined();
      expect(data!.getOfferByUuid).toMatchObject(
        {
          uuid: uuid,
          hasApplied: false
        }
      );
    });
  });

  describe("when no offer exists", () => {
    it("throws and error if no offer exist", async () => {
      const { apolloClient } = await testClientFactory.applicant();
      const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      const { errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID,
        variables: { uuid: randomUuid }
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: OfferNotFound.name });
    });

    it("returns an error if the current user is not an applicant", async () => {
      const user = await userFactory.user();
      const apolloClient = client.loggedIn({
        uuid: user.uuid,
        email: user.email
      });
      const company = await userFactory.company();
      const { offer: { uuid } } = await createOffer(company);

      const { errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
        variables: { uuid: uuid }
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut;
      const company = await userFactory.company();

      const { offer: { uuid } } = await createOffer(company);
      const { errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
        variables: { uuid: uuid }
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });
  });
});
