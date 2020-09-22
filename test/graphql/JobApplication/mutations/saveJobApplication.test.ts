import { ApolloError, gql } from "apollo-server";
import { ApolloServerTestClient as ApolloClient } from "apollo-server-testing";
import { client } from "$test/graphql/ApolloTestClient";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { OfferNotTargetedForApplicantError } from "$models/JobApplication";
import { Secretary } from "$models/Admin";
import { Company, Career, Offer, Applicant, Admin } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

import { OfferNotFoundError } from "$models/Offer/Errors";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { OfferGenerator } from "$generators/Offer";
import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";
import { CareerGenerator } from "$generators/Career";
import generateUuid from "uuid/v4";
import { UUID_REGEX } from "$test/models";

const SAVE_JOB_APPLICATION = gql`
  mutation saveJobApplication($offerUuid: String!) {
    saveJobApplication(offerUuid: $offerUuid) {
      uuid
      offerUuid
      applicantUuid
    }
  }
`;

describe("saveJobApplication", () => {
  let company: Company;
  let firstCareer: Career;
  let secondCareer: Career;
  let extensionAdmin: Admin;
  let graduadosAdmin: Admin;
  let offerForStudents: Offer;
  let offerForGraduates: Offer;
  let offerForStudentsAndGraduates: Offer;
  let studentClient: { apolloClient: ApolloClient; applicant: Applicant };
  let graduateClient: { apolloClient: ApolloClient; applicant: Applicant };
  let studentAndGraduateClient: { apolloClient: ApolloClient; applicant: Applicant };

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();

    extensionAdmin = await AdminGenerator.instance({ secretary: Secretary.extension });
    graduadosAdmin = await AdminGenerator.instance({ secretary: Secretary.graduados });

    company = await CompanyGenerator.instance.withCompleteData();
    offerForStudents = await OfferGenerator.instance.forStudents({ companyUuid: company.uuid });
    offerForGraduates = await OfferGenerator.instance.forGraduates({ companyUuid: company.uuid });
    offerForStudentsAndGraduates = await OfferGenerator.instance.forStudentsAndGraduates({
      companyUuid: company.uuid
    });

    studentClient = await TestClientGenerator.applicant({
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: extensionAdmin
      },
      careers: [
        {
          careerCode: firstCareer.code,
          isGraduate: false,
          currentCareerYear: 4,
          approvedSubjectCount: 33
        }
      ]
    });

    graduateClient = await TestClientGenerator.applicant({
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: graduadosAdmin
      },
      careers: [
        {
          careerCode: firstCareer.code,
          isGraduate: true
        }
      ]
    });

    studentAndGraduateClient = await TestClientGenerator.applicant({
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: graduadosAdmin
      },
      careers: [
        {
          careerCode: firstCareer.code,
          isGraduate: false,
          currentCareerYear: 4,
          approvedSubjectCount: 33
        },
        {
          careerCode: secondCareer.code,
          isGraduate: true
        }
      ]
    });
  });

  const performMutation = (apolloClient: ApolloClient, offer: Offer) =>
    apolloClient.mutate({
      mutation: SAVE_JOB_APPLICATION,
      variables: { offerUuid: offer.uuid }
    });

  const expectToApply = async (apolloClient: ApolloClient, offer: Offer, applicant: Applicant) => {
    const { data, errors } = await performMutation(apolloClient, offer);
    expect(errors).toBeUndefined();
    expect(data!.saveJobApplication).toEqual({
      uuid: expect.stringMatching(UUID_REGEX),
      offerUuid: offer.uuid,
      applicantUuid: applicant.uuid
    });
  };

  it("allows student to apply to an offer for students", async () => {
    const { applicant, apolloClient } = studentClient;
    await expectToApply(apolloClient, offerForStudents, applicant);
  });

  it("allows student to apply to an offer for students and graduates", async () => {
    const { applicant, apolloClient } = studentClient;
    await expectToApply(apolloClient, offerForStudentsAndGraduates, applicant);
  });

  it("allows graduate to apply to an offer for graduates", async () => {
    const { applicant, apolloClient } = graduateClient;
    await expectToApply(apolloClient, offerForGraduates, applicant);
  });

  it("allows graduate to apply to an offer for graduates and students", async () => {
    const { applicant, apolloClient } = graduateClient;
    await expectToApply(apolloClient, offerForStudentsAndGraduates, applicant);
  });

  it("allows student and graduate to apply to an offer for graduates", async () => {
    const { applicant, apolloClient } = studentAndGraduateClient;
    await expectToApply(apolloClient, offerForGraduates, applicant);
  });

  it("allows student and graduate to apply to an offer for students", async () => {
    const { applicant, apolloClient } = studentAndGraduateClient;
    await expectToApply(apolloClient, offerForStudents, applicant);
  });

  it("allows student and graduate to apply to an offer for students and graduates", async () => {
    const { applicant, apolloClient } = studentAndGraduateClient;
    await expectToApply(apolloClient, offerForStudentsAndGraduates, applicant);
  });

  it("returns an error if a student applies to an offer for graduates", async () => {
    const { apolloClient } = studentClient;
    const { errors } = await performMutation(apolloClient, offerForGraduates);
    expect(errors![0].extensions!.data).toEqual({
      errorType: OfferNotTargetedForApplicantError.name
    });
  });

  it("returns an error if a graduate applies to an offer for students", async () => {
    const { apolloClient } = graduateClient;
    const { errors } = await performMutation(apolloClient, offerForStudents);
    expect(errors![0].extensions!.data).toEqual({
      errorType: OfferNotTargetedForApplicantError.name
    });
  });

  describe("Errors", () => {
    it("returns an error if no offerUuid is provided", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION
      });
      expect(errors![0].constructor.name).toEqual(ApolloError.name);
    });

    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: AuthenticationError.name
      });
    });

    it("returns an error if current user is not an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if current user is a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if current user is an admin", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if current user is a pending applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if current user is a rejected applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: {
          approvalStatus: ApprovalStatus.rejected,
          admin: await AdminGenerator.instance({ secretary: Secretary.extension })
        }
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if the application already exist", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await AdminGenerator.instance({ secretary: Secretary.extension })
        },
        careers: [
          {
            careerCode: secondCareer.code,
            isGraduate: false,
            currentCareerYear: 4,
            approvedSubjectCount: 33
          }
        ]
      });
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
      await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });

      expect(errors![0].extensions!.data).toMatchObject({
        errorType: "JobApplicationAlreadyExistsError"
      });
    });

    it("returns an error if the offer does not exist", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await AdminGenerator.instance({ secretary: Secretary.extension })
        }
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da" }
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: OfferNotFoundError.name
      });
    });
  });
});
