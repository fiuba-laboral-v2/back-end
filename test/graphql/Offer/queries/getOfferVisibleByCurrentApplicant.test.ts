import { gql } from "apollo-server";
import { ApolloServerTestClient } from "apollo-server-testing";
import { client } from "$test/graphql/ApolloTestClient";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { JobApplicationRepository } from "$models/JobApplication";
import { UserRepository } from "$models/User";
import { OfferNotFoundError } from "$models/Offer/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantType } from "$models/Offer";
import { Secretary } from "$models/Admin";
import { Offer } from "$models";
import { OfferNotVisibleByCurrentUserError } from "$graphql/Offer/Queries/Errors";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { Constructable } from "$test/types/Constructable";
import { OfferGenerator } from "$generators/Offer";
import { CareerGenerator } from "$generators/Career";
import { CompanyGenerator } from "$generators/Company";
import { TestClientGenerator } from "$generators/TestClient";
import { AdminGenerator } from "$generators/Admin";
import generateUuid from "uuid/v4";

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
  let companyUuid: string;
  let applicantCareers: object;
  let admins: object;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();

    companyUuid = (await CompanyGenerator.instance.withCompleteData()).uuid;

    admins = {
      [Secretary.extension]: await AdminGenerator.instance({ secretary: Secretary.extension }),
      [Secretary.graduados]: await AdminGenerator.instance({ secretary: Secretary.graduados })
    };

    const firstCareer = await CareerGenerator.instance();
    const secondCareer = await CareerGenerator.instance();

    applicantCareers = {
      [ApplicantType.student]: [
        {
          careerCode: firstCareer.code,
          isGraduate: false,
          currentCareerYear: 5,
          approvedSubjectCount: 40
        }
      ],
      [ApplicantType.graduate]: [
        {
          careerCode: secondCareer.code,
          isGraduate: true
        }
      ],
      [ApplicantType.both]: [
        {
          careerCode: firstCareer.code,
          isGraduate: false,
          currentCareerYear: 5,
          approvedSubjectCount: 40
        },
        {
          careerCode: secondCareer.code,
          isGraduate: true
        }
      ]
    };
  });

  const approvedApplicantTestClient = async (applicantType: ApplicantType) => {
    let secretary = Secretary.graduados;
    if (applicantType === ApplicantType.both) secretary = Secretary.graduados;
    if (applicantType === ApplicantType.graduate) secretary = Secretary.graduados;
    if (applicantType === ApplicantType.student) secretary = Secretary.extension;

    return TestClientGenerator.applicant({
      careers: applicantCareers[applicantType],
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: admins[secretary]
      }
    });
  };

  const getOffer = async (apolloClient: ApolloServerTestClient, offer: Offer) => {
    return apolloClient.query({
      query: GET_OFFER_BY_UUID,
      variables: { uuid: offer.uuid }
    });
  };

  const expectToGetOffer = async (apolloClient: ApolloServerTestClient, offer: Offer) => {
    const { data, errors } = await getOffer(apolloClient, offer);
    expect(errors).toBeUndefined();

    const company = await offer.getCompany();
    const careers = await offer.getCareers();
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
      careers: careers.map(career => ({
        code: career.code,
        description: career.description
      })),
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
  };

  const expectToReturnError = async (
    apolloClient: ApolloServerTestClient,
    offer: Offer,
    error: Constructable
  ) => {
    const { errors } = await getOffer(apolloClient, offer);
    expect(errors![0].extensions!.data).toEqual({ errorType: error.name });
  };

  it("returns an offer for the company", async () => {
    const { company, apolloClient } = await TestClientGenerator.company({
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: await AdminGenerator.instance({ secretary: Secretary.extension })
      }
    });
    const offer = await OfferGenerator.instance.forStudents({ companyUuid: company.uuid });
    await expectToGetOffer(apolloClient, offer);
  });

  it("returns offer targeted to students for a student", async () => {
    const offer = await OfferGenerator.instance.forStudents({ companyUuid });
    const { apolloClient } = await approvedApplicantTestClient(ApplicantType.student);
    await expectToGetOffer(apolloClient, offer);
  });

  it("returns offer targeted to graduates for a graduate", async () => {
    const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
    const { apolloClient } = await approvedApplicantTestClient(ApplicantType.graduate);
    await expectToGetOffer(apolloClient, offer);
  });

  it("returns offer targeted to both for a student and graduate applicant", async () => {
    const offer = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
    const { apolloClient } = await approvedApplicantTestClient(ApplicantType.both);
    await expectToGetOffer(apolloClient, offer);
  });

  it("returns offer targeted to both for a student", async () => {
    const offer = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
    const { apolloClient } = await approvedApplicantTestClient(ApplicantType.student);
    await expectToGetOffer(apolloClient, offer);
  });

  it("returns offer targeted to both for a graduate", async () => {
    const offer = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
    const { apolloClient } = await approvedApplicantTestClient(ApplicantType.graduate);
    await expectToGetOffer(apolloClient, offer);
  });

  it("returns error if the offer is targeted to students for a graduate applicant", async () => {
    const offer = await OfferGenerator.instance.forStudents({ companyUuid });
    const { apolloClient } = await approvedApplicantTestClient(ApplicantType.graduate);
    await expectToReturnError(apolloClient, offer, OfferNotVisibleByCurrentUserError);
  });

  it("returns error if the offer is targeted to graduates for a student applicant", async () => {
    const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
    const { apolloClient } = await approvedApplicantTestClient(ApplicantType.student);
    await expectToReturnError(apolloClient, offer, OfferNotVisibleByCurrentUserError);
  });

  it("returns error if the offer does not exists", async () => {
    const offer = new Offer({ uuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da" });
    const { apolloClient } = await approvedApplicantTestClient(ApplicantType.graduate);
    await expectToReturnError(apolloClient, offer, OfferNotFoundError);
  });

  it("finds an offer with hasApplied in true", async () => {
    const { apolloClient, applicant } = await approvedApplicantTestClient(ApplicantType.both);
    const offer = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
    await JobApplicationRepository.apply(applicant, offer);
    const { data, errors } = await apolloClient.query({
      query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
      variables: { uuid: offer.uuid }
    });

    expect(errors).toBeUndefined();
    expect(data!.getOfferByUuid.hasApplied).toBe(true);
  });

  it("finds an offer with hasApplied in false", async () => {
    const { apolloClient } = await approvedApplicantTestClient(ApplicantType.both);
    const offer = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
    const { data, errors } = await apolloClient.query({
      query: GET_OFFER_BY_UUID_WITH_APPLIED_INFORMATION,
      variables: { uuid: offer.uuid }
    });

    expect(errors).toBeUndefined();
    expect(data!.getOfferByUuid.hasApplied).toBe(false);
  });

  describe("query permissions", () => {
    it("returns error if there is no current user", async () => {
      const apolloClient = await client.loggedOut();
      const { errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID,
        variables: { uuid: generateUuid() }
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: AuthenticationError.name
      });
    });

    it("returns error if current user is from a pending company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const { errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID,
        variables: { uuid: generateUuid() }
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns error if current user is from a rejected company", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: {
          approvalStatus: ApprovalStatus.rejected,
          admin: await AdminGenerator.instance({ secretary: Secretary.extension })
        }
      });
      const { errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID,
        variables: { uuid: generateUuid() }
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns error if current user a rejected applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: {
          approvalStatus: ApprovalStatus.rejected,
          admin: admins[Secretary.graduados]
        }
      });
      const { errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID,
        variables: { uuid: generateUuid() }
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns error if current user a pending applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: {
          approvalStatus: ApprovalStatus.pending,
          admin: admins[Secretary.graduados]
        }
      });
      const { errors } = await apolloClient.query({
        query: GET_OFFER_BY_UUID,
        variables: { uuid: generateUuid() }
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });
  });
});
