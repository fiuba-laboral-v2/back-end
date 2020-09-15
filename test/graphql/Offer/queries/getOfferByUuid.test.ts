import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { OfferNotFoundError } from "$models/Offer/Errors";
import { Admin } from "$models";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { Constructable } from "$test/types/Constructable";
import { CareerGenerator } from "$generators/Career";
import { OfferGenerator } from "$generators/Offer";
import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";

import { ApolloServerTestClient } from "apollo-server-testing";
import generateUuid from "uuid/v4";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";

const GET_OFFER_BY_UUID = gql`
  query($uuid: ID!) {
    getOfferByUuid(uuid: $uuid) {
      uuid
      title
      description
      targetApplicantType
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
        targetApplicantType: offer.targetApplicantType,
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
  });

  it("throws and error if no offer exist", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await apolloClient.query({
      query: GET_OFFER_BY_UUID,
      variables: { uuid: generateUuid() }
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: OfferNotFoundError.name
    });
  });

  describe("query permissions", () => {
    let admin: Admin;

    beforeAll(async () => {
      admin = await AdminGenerator.instance({ secretary: Secretary.graduados });
    });

    const expectToReturnError = async (
      apolloClient: ApolloServerTestClient,
      error: Constructable
    ) => {
      const { errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
        variables: { uuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: error.name
      });
    };

    const expectUnauthorizedError = async (apolloClient: ApolloServerTestClient) => {
      await expectToReturnError(apolloClient, UnauthorizedError);
    };

    const expectAuthenticationError = async (apolloClient: ApolloServerTestClient) => {
      await expectToReturnError(apolloClient, AuthenticationError);
    };

    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      await expectAuthenticationError(apolloClient);
    });

    it("returns an error if the current user is an approved applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      await expectUnauthorizedError(apolloClient);
    });

    it("returns an error if the current user is a rejected applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: {
          admin,
          approvalStatus: ApprovalStatus.rejected
        }
      });
      await expectUnauthorizedError(apolloClient);
    });

    it("returns an error if the current user is a pending applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: {
          admin,
          approvalStatus: ApprovalStatus.pending
        }
      });
      await expectUnauthorizedError(apolloClient);
    });

    it("returns an error if the user is not from a rejected company", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.rejected
        }
      });
      await expectUnauthorizedError(apolloClient);
    });

    it("returns an error if the user is not from a pending company", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.pending
        }
      });
      await expectUnauthorizedError(apolloClient);
    });
  });
});
