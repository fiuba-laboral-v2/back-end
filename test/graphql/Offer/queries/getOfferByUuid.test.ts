import { gql } from "apollo-server";
import { executeQuery, testCurrentUserEmail, client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { OfferRepository } from "../../../../src/models/Offer";
import { JobApplicationRepository } from "../../../../src/models/JobApplication";
import { ApplicantRepository } from "../../../../src/models/Applicant";
import { UserRepository } from "../../../../src/models/User";

import { OfferNotFound } from "../../../../src/models/Offer/Errors";
import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

import { careerMocks } from "../../../models/Career/mocks";
import { companyMocks } from "../../../models/Company/mocks";
import { OfferMocks } from "../../../models/Offer/mocks";
import { applicantMocks } from "../../../models/Applicant/mocks";
import { userFactory } from "../../../mocks/user";

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
  beforeAll(() => Database.setConnection());

  beforeEach(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
  });

  afterAll(() => Database.close());

  const createOffer = async () => {
    const company = await CompanyRepository.create(companyMocks.companyData());
    const career = await CareerRepository.create(careerMocks.careerData());
    const offer = await OfferRepository.create(
      OfferMocks.withOneCareerAndOneSection(company.uuid, career.code)
    );
    return { offer, career, company };
  };

  const userAttributes = {
    email: testCurrentUserEmail,
    password: "AValidPassword2",
    name: "name",
    surname: "surname"
  };

  const createApplicant = () => {
    return ApplicantRepository.create(
      applicantMocks.applicantData(
        [],
        [],
        [],
        [],
        userAttributes
      )
    );
  };

  describe("when and offer exists", () => {
    it("should find an offer by uuid", async () => {
      const { offer, career, company } = await createOffer();
      const { data: { getOfferByUuid }, errors } = await executeQuery(
        GET_OFFER_BY_UUID,
        { uuid: offer.uuid }
      );
      expect(errors).toBeUndefined();
      expect(getOfferByUuid).toMatchObject(
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
          sections: await offer.getSections().map(section => (
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

    it("should find an offer with hasApplied in true", async () => {
      const applicant = await userFactory.applicantUser();
      const user = await applicant.getUser();
      const apolloClient = client.loggedIn(
        { uuid: user.uuid, email: user.email, applicantUuid: applicant.uuid }
      );

      const { offer } = await createOffer();
      await JobApplicationRepository.apply(applicant, offer);

      const { data: { getOfferByUuid }, errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
        variables: { uuid: offer.uuid }
      });

      expect(errors).toBeUndefined();
      expect(getOfferByUuid).toMatchObject(
        {
          uuid: offer.uuid,
          hasApplied: true
        }
      );
    });

    it("should find an offer with hasApplied in false", async () => {
      const { offer: { uuid } } = await createOffer();
      await createApplicant();
      const { data: { getOfferByUuid }, errors } = await executeQuery(
        GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
        { uuid: uuid }
      );
      expect(errors).toBeUndefined();
      expect(getOfferByUuid).toMatchObject(
        {
          uuid: uuid,
          hasApplied: false
        }
      );
    });
  });

  describe("when no offer exists", () => {
    it("should throw and error if no offer exist", async () => {
      const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      const { errors } = await executeQuery(
        GET_OFFER_BY_UUID,
        { uuid: randomUuid }
      );
      expect(errors[0].extensions.data).toEqual({ errorType: OfferNotFound.name });
    });

    it("should return an error if the current user is not an applicant", async () => {
      const user = await userFactory.user();
      const apolloClient = client.loggedIn(
        { uuid: user.uuid, email: user.email }
      );
      const { offer: { uuid } } = await createOffer();

      const { errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
        variables: { uuid: uuid }
      });

      expect(errors[0].extensions.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("should return an error if there is no current user", async () => {
      const { offer: { uuid } } = await createOffer();
      const { errors } = await executeQuery(
        GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
        { uuid: uuid },
        { loggedIn: false }
      );
      expect(errors[0].extensions.data).toEqual({ errorType: AuthenticationError.name });
    });
  });
});
