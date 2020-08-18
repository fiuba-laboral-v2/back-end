import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { JobApplicationRepository } from "$models/JobApplication";
import { UserRepository } from "$models/User";
import { OfferNotFound } from "$models/Offer/Errors";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { CareerGenerator } from "$generators/Career";
import { OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";
import { UserGenerator } from "$generators/User";
import { TestClientGenerator } from "$generators/TestClient";
import { ApolloServerTestClient } from "apollo-server-testing";
import generateUuid from "uuid/v4";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AdminGenerator } from "$generators/Admin";
import { Secretary } from "$models/Admin";

const GET_OFFER_BY_UUID = gql`
  query($uuid: ID!) {
    getOfferByUuid(uuid: $uuid) {
      uuid
      title
      description
      target
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
  query($uuid: ID!) {
    getOfferByUuid(uuid: $uuid) {
      uuid
      hasApplied
    }
  }
`;

describe("getOfferByUuid", () => {
  beforeAll(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
  });

  const createOffer = async company => {
    const career = await CareerGenerator.instance();
    const careerCode = career.code;
    const offer = await OfferGenerator.instance.withOneSection({
      companyUuid: company.uuid,
      careers: [{ careerCode }]
    });
    return { offer, career, company };
  };

  describe("when and offer exists", () => {
    it("finds an offer by uuid", async () => {
      const { company, apolloClient } = await TestClientGenerator.company({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await AdminGenerator.instance({ secretary: Secretary.extension })
        }
      });
      const { offer, career } = await createOffer(company);
      const { data, errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID,
        variables: { uuid: offer.uuid }
      });
      expect(errors).toBeUndefined();
      const phoneNumbers = await company.getPhoneNumbers();
      expect(data!.getOfferByUuid).toMatchObject({
        uuid: offer.uuid,
        title: offer.title,
        description: offer.description,
        target: offer.target,
        hoursPerDay: offer.hoursPerDay,
        minimumSalary: offer.minimumSalary,
        maximumSalary: offer.maximumSalary,
        createdAt: offer.createdAt.toISOString(),
        careers: [
          {
            code: career.code,
            description: career.description
          }
        ],
        sections: (await offer.getSections()).map(section => ({
          uuid: section.uuid,
          title: section.title,
          text: section.text,
          displayOrder: section.displayOrder
        })),
        company: {
          cuit: company.cuit,
          companyName: company.companyName,
          slogan: company.slogan,
          description: company.description,
          logo: company.logo,
          website: company.website,
          email: company.email,
          phoneNumbers: phoneNumbers.map(phoneNumber => phoneNumber.phoneNumber),
          photos: await company.getPhotos()
        }
      });
    });

    it("finds an offer with hasApplied in true", async () => {
      const { applicant, apolloClient } = await TestClientGenerator.applicant({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await AdminGenerator.instance({ secretary: Secretary.extension })
        }
      });
      const company = await CompanyGenerator.instance.withCompleteData();
      const { offer } = await createOffer(company);
      await JobApplicationRepository.apply(applicant.uuid, offer);

      const { data, errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
        variables: { uuid: offer.uuid }
      });

      expect(errors).toBeUndefined();
      expect(data!.getOfferByUuid).toMatchObject({
        uuid: offer.uuid,
        hasApplied: true
      });
    });

    it("finds an offer with hasApplied in false", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await AdminGenerator.instance({ secretary: Secretary.extension })
        }
      });
      const company = await CompanyGenerator.instance.withCompleteData();
      const {
        offer: { uuid }
      } = await createOffer(company);
      const { data, errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
        variables: { uuid: uuid }
      });
      expect(errors).toBeUndefined();
      expect(data!.getOfferByUuid).toMatchObject({
        uuid: uuid,
        hasApplied: false
      });
    });
  });

  describe("when no offer exists", () => {
    it("throws and error if no offer exist", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      const { errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID,
        variables: { uuid: randomUuid }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: OfferNotFound.name
      });
    });

    it("returns an error if the current user is not an applicant", async () => {
      const user = await UserGenerator.instance();
      const apolloClient = client.loggedIn({
        currentUser: {
          uuid: user.uuid,
          email: user.email
        }
      });
      const company = await CompanyGenerator.instance.withCompleteData();
      const {
        offer: { uuid }
      } = await createOffer(company);

      const { errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
        variables: { uuid: uuid }
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const company = await CompanyGenerator.instance.withCompleteData();

      const {
        offer: { uuid }
      } = await createOffer(company);
      const { errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
        variables: { uuid: uuid }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: AuthenticationError.name
      });
    });

    it("returns an error if the user is not admin, approved company or approved applicant", async () => {
      const expectUnauthorized = async ({
        apolloClient
      }: {
        apolloClient: ApolloServerTestClient;
      }) => {
        const { errors } = await apolloClient.query({
          query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
          variables: { uuid: generateUuid() }
        });
        expect(errors![0].extensions!.data).toEqual({
          errorType: UnauthorizedError.name
        });
      };
      await expectUnauthorized(await TestClientGenerator.company());
      await expectUnauthorized(await TestClientGenerator.applicant());
      await expectUnauthorized(await TestClientGenerator.user());
    });
  });
});
