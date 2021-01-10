import { ApolloError, gql } from "apollo-server";
import { ApolloServerTestClient as ApolloClient } from "apollo-server-testing";
import { client } from "$test/graphql/ApolloTestClient";

import {
  ApplicantNotificationRepository,
  ApprovedJobApplicationApplicantNotification,
  PendingJobApplicationApplicantNotification
} from "$models/ApplicantNotification";
import {
  CompanyNotificationRepository,
  NewJobApplicationCompanyNotification
} from "$models/CompanyNotification";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { EmailService } from "$services";

import { OfferNotFoundError } from "$models/Offer/Errors";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import {
  JobApplicationRepository,
  OfferNotTargetedForApplicantError
} from "$models/JobApplication";
import { Applicant, Career, Company, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { IApplicantCareer } from "$models/Applicant/ApplicantCareer";
import { UUID } from "$models/UUID";
import { ApplicantType } from "$models/Applicant";

import { IForAllTargetsAndStatuses, OfferGenerator } from "$generators/Offer";
import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";
import { CareerGenerator } from "$generators/Career";
import { UUID_REGEX } from "$test/models";
import { Constructable } from "$test/types/Constructable";

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
  let offers: IForAllTargetsAndStatuses;
  let studentClient: { apolloClient: ApolloClient; applicant: Applicant };
  let graduateClient: { apolloClient: ApolloClient; applicant: Applicant };
  let studentAndGraduateClient: { apolloClient: ApolloClient; applicant: Applicant };
  let graduateCareers: IApplicantCareer[];
  let studentCareers: IApplicantCareer[];
  let studentAndGraduateCareers: IApplicantCareer[];

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();

    company = await CompanyGenerator.instance.withCompleteData();
    const companyUuid = company.uuid;
    offers = await OfferGenerator.instance.forAllTargetsAndStatuses({ companyUuid });

    studentCareers = [
      {
        careerCode: firstCareer.code,
        isGraduate: false,
        currentCareerYear: 4,
        approvedSubjectCount: 33
      }
    ];

    graduateCareers = [
      {
        careerCode: firstCareer.code,
        isGraduate: true
      }
    ];

    studentAndGraduateCareers = [
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
    ];

    studentClient = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved,
      careers: studentCareers
    });

    graduateClient = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved,
      careers: graduateCareers
    });

    studentAndGraduateClient = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved,
      careers: studentAndGraduateCareers
    });
  });

  beforeEach(() => {
    jest.spyOn(EmailService, "send").mockImplementation(jest.fn());
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

  const expectToReApply = async (
    apolloClient: ApolloClient,
    offer: Offer,
    applicant: Applicant
  ) => {
    const { errors: firstErrors } = await performMutation(apolloClient, offer);
    expect(firstErrors).toBeUndefined();
    const jobApplication = await JobApplicationRepository.findByApplicantAndOffer(applicant, offer);
    jobApplication.set({ approvalStatus: ApprovalStatus.rejected });
    await JobApplicationRepository.save(jobApplication);

    const { data, errors } = await performMutation(apolloClient, offer);
    expect(errors).toBeUndefined();
    expect(data!.saveJobApplication).toEqual({
      uuid: expect.stringMatching(UUID_REGEX),
      offerUuid: offer.uuid,
      applicantUuid: applicant.uuid
    });
  };

  const expectToReturnError = async (apolloClient: ApolloClient, offer: Offer) => {
    const { errors } = await performMutation(apolloClient, offer);
    expect(errors).toEqualGraphQLErrorType(OfferNotTargetedForApplicantError.name);
  };

  it("allows student to apply to an approved offer for students", async () => {
    const { applicant, apolloClient } = studentClient;
    await expectToApply(
      apolloClient,
      offers[ApplicantType.student][ApprovalStatus.approved],
      applicant
    );
  });

  it("allows student to reapply to an approved offer for students if the application was rejected", async () => {
    const { applicant, apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved,
      careers: studentCareers
    });
    await expectToReApply(
      apolloClient,
      offers[ApplicantType.student][ApprovalStatus.approved],
      applicant
    );
  });

  it("allows student to apply to an an approved offer for students and graduates", async () => {
    const { applicant, apolloClient } = studentClient;
    await expectToApply(
      apolloClient,
      offers[ApplicantType.both][ApprovalStatus.approved],
      applicant
    );
  });

  it("allows student to reapply to an an approved offer for students and graduates if the application was rejected", async () => {
    const { applicant, apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved,
      careers: studentCareers
    });
    await expectToReApply(
      apolloClient,
      offers[ApplicantType.both][ApprovalStatus.approved],
      applicant
    );
  });

  it("allows graduate to apply to an an approved offer for graduates", async () => {
    const { applicant, apolloClient } = graduateClient;
    await expectToApply(
      apolloClient,
      offers[ApplicantType.graduate][ApprovalStatus.approved],
      applicant
    );
  });

  it("allows graduate to reapply to an an approved offer for graduates if the application was rejected", async () => {
    const { applicant, apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved,
      careers: graduateCareers
    });
    await expectToReApply(
      apolloClient,
      offers[ApplicantType.graduate][ApprovalStatus.approved],
      applicant
    );
  });

  it("allows graduate to apply to an an approved offer for graduates and students", async () => {
    const { applicant, apolloClient } = graduateClient;
    await expectToApply(
      apolloClient,
      offers[ApplicantType.both][ApprovalStatus.approved],
      applicant
    );
  });

  it("allows graduate to reapply to an an approved offer for graduates and students if the application was rejected", async () => {
    const { applicant, apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved,
      careers: graduateCareers
    });
    await expectToReApply(
      apolloClient,
      offers[ApplicantType.both][ApprovalStatus.approved],
      applicant
    );
  });

  it("allows student and graduate to apply to an approved offer for graduates", async () => {
    const { applicant, apolloClient } = studentAndGraduateClient;
    await expectToApply(
      apolloClient,
      offers[ApplicantType.graduate][ApprovalStatus.approved],
      applicant
    );
  });

  it("allows student and graduate to apply to an approved offer for graduates if the application was rejected", async () => {
    const { applicant, apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved,
      careers: studentAndGraduateCareers
    });
    await expectToReApply(
      apolloClient,
      offers[ApplicantType.graduate][ApprovalStatus.approved],
      applicant
    );
  });

  it("allows student and graduate to apply to an approved offer for students", async () => {
    const { applicant, apolloClient } = studentAndGraduateClient;
    await expectToApply(
      apolloClient,
      offers[ApplicantType.student][ApprovalStatus.approved],
      applicant
    );
  });

  it("allows student and graduate to reapply to an approved offer for students if the application was rejected", async () => {
    const { applicant, apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved,
      careers: studentAndGraduateCareers
    });
    await expectToReApply(
      apolloClient,
      offers[ApplicantType.student][ApprovalStatus.approved],
      applicant
    );
  });

  it("allows student and graduate to apply to an approved offer for students and graduates", async () => {
    const { applicant, apolloClient } = studentAndGraduateClient;
    await expectToApply(
      apolloClient,
      offers[ApplicantType.both][ApprovalStatus.approved],
      applicant
    );
  });

  it("allows student and graduate to reapply to an approved offer for students and graduates if the application was rejected", async () => {
    const { applicant, apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved,
      careers: studentAndGraduateCareers
    });
    await expectToReApply(
      apolloClient,
      offers[ApplicantType.both][ApprovalStatus.approved],
      applicant
    );
  });

  describe("Notifications", () => {
    beforeEach(() => CompanyNotificationRepository.truncate());

    const expectToLogCompanyNotification = async (careers: IApplicantCareer[]) => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: ApprovalStatus.approved,
        careers
      });
      const offer = offers[ApplicantType.both][ApprovalStatus.approved];
      const { data, errors } = await performMutation(apolloClient, offer);
      expect(errors).toBeUndefined();

      const { findLatestByCompany } = CompanyNotificationRepository;
      const { results } = await findLatestByCompany({ companyUuid: offer.companyUuid });
      const [notification] = results;

      expect(notification).toBeInstanceOf(NewJobApplicationCompanyNotification);
      expect(results).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          moderatorUuid: expect.stringMatching(UUID_REGEX),
          notifiedCompanyUuid: offer.companyUuid,
          isNew: true,
          jobApplicationUuid: data!.saveJobApplication.uuid,
          createdAt: expect.any(Date)
        }
      ]);
    };

    const expectToLogApplicantNotification = async (
      careers: IApplicantCareer[],
      model: Constructable
    ) => {
      const { applicant, apolloClient } = await TestClientGenerator.applicant({
        status: ApprovalStatus.approved,
        careers
      });
      const offer = offers[ApplicantType.both][ApprovalStatus.approved];
      const { data, errors } = await performMutation(apolloClient, offer);
      expect(errors).toBeUndefined();

      const { findLatestByApplicant } = ApplicantNotificationRepository;
      const { results } = await findLatestByApplicant({ applicantUuid: applicant.uuid });
      const [notification] = results;

      expect(notification).toBeInstanceOf(model);
      expect(results).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          moderatorUuid: expect.stringMatching(UUID_REGEX),
          notifiedApplicantUuid: applicant.uuid,
          isNew: true,
          jobApplicationUuid: data!.saveJobApplication.uuid,
          createdAt: expect.any(Date)
        }
      ]);
    };

    it("creates a pendingJobApplication notification for a student", async () => {
      await expectToLogApplicantNotification(
        studentCareers,
        PendingJobApplicationApplicantNotification
      );
    });

    it("creates an approvedJobApplication notification for a graduate", async () => {
      await expectToLogApplicantNotification(
        graduateCareers,
        ApprovedJobApplicationApplicantNotification
      );
    });

    it("creates an approvedJobApplication notification for a graduate and student", async () => {
      await expectToLogApplicantNotification(
        studentAndGraduateCareers,
        ApprovedJobApplicationApplicantNotification
      );
    });

    it("creates a notification for a company if the applicant is a graduate", async () => {
      await expectToLogCompanyNotification(graduateCareers);
    });

    it("creates a notification for a company if the applicant is a student and a graduate", async () => {
      await expectToLogCompanyNotification(studentAndGraduateCareers);
    });
  });

  it("returns an error if a student applies to a pending offer for students", async () => {
    const { apolloClient } = studentClient;
    await expectToReturnError(apolloClient, offers[ApplicantType.graduate][ApprovalStatus.pending]);
  });

  it("returns an error if a student applies to a rejected offer for students", async () => {
    const { apolloClient } = studentClient;
    await expectToReturnError(
      apolloClient,
      offers[ApplicantType.graduate][ApprovalStatus.rejected]
    );
  });

  it("returns an error if a student applies to a pending offer for both", async () => {
    const { apolloClient } = studentClient;
    await expectToReturnError(apolloClient, offers[ApplicantType.both][ApprovalStatus.pending]);
  });

  it("returns an error if a student applies to a rejected offer for both", async () => {
    const { apolloClient } = studentClient;
    await expectToReturnError(apolloClient, offers[ApplicantType.both][ApprovalStatus.rejected]);
  });

  it("returns an error if a graduate applies to a pending offer for graduates", async () => {
    const { apolloClient } = graduateClient;
    await expectToReturnError(apolloClient, offers[ApplicantType.graduate][ApprovalStatus.pending]);
  });

  it("returns an error if a graduate applies to a rejected offer for graduates", async () => {
    const { apolloClient } = graduateClient;
    await expectToReturnError(
      apolloClient,
      offers[ApplicantType.graduate][ApprovalStatus.rejected]
    );
  });

  it("returns an error if a graduate applies to a pending offer for both", async () => {
    const { apolloClient } = graduateClient;
    await expectToReturnError(apolloClient, offers[ApplicantType.both][ApprovalStatus.pending]);
  });

  it("returns an error if a graduate applies to a rejected offer for both", async () => {
    const { apolloClient } = graduateClient;
    await expectToReturnError(apolloClient, offers[ApplicantType.both][ApprovalStatus.rejected]);
  });

  it("returns an error if a student applies to an approved offer for graduates", async () => {
    const { apolloClient } = studentClient;
    await expectToReturnError(
      apolloClient,
      offers[ApplicantType.graduate][ApprovalStatus.approved]
    );
  });

  it("returns an error if a student applies to a rejected offer for graduates", async () => {
    const { apolloClient } = studentClient;
    await expectToReturnError(
      apolloClient,
      offers[ApplicantType.graduate][ApprovalStatus.rejected]
    );
  });

  it("returns an error if a student applies to a pending offer for graduates", async () => {
    const { apolloClient } = studentClient;
    await expectToReturnError(apolloClient, offers[ApplicantType.graduate][ApprovalStatus.pending]);
  });

  it("returns an error if a graduate applies to an approved offer for students", async () => {
    const { apolloClient } = graduateClient;
    await expectToReturnError(apolloClient, offers[ApplicantType.student][ApprovalStatus.approved]);
  });

  it("returns an error if a graduate applies to a pending offer for students", async () => {
    const { apolloClient } = graduateClient;
    await expectToReturnError(apolloClient, offers[ApplicantType.student][ApprovalStatus.pending]);
  });

  it("returns an error if a graduate applies to a rejected offer for students", async () => {
    const { apolloClient } = graduateClient;
    await expectToReturnError(apolloClient, offers[ApplicantType.student][ApprovalStatus.rejected]);
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

      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if current user is not an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: UUID.generate() }
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: UUID.generate() }
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is an admin", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: UUID.generate() }
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is a pending applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: UUID.generate() }
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is a rejected applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: ApprovalStatus.rejected
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: UUID.generate() }
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if the application already exist and it's pending", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: ApprovalStatus.approved,
        careers: [
          {
            careerCode: secondCareer.code,
            isGraduate: false,
            currentCareerYear: 4,
            approvedSubjectCount: 33
          }
        ]
      });
      const offer = await OfferGenerator.instance.forStudents({
        companyUuid: company.uuid,
        status: ApprovalStatus.approved
      });
      await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });

      expect(errors).toEqualGraphQLErrorType("JobApplicationAlreadyExistsError");
    });

    it("returns an error if the application already exist and it's approved", async () => {
      const { apolloClient, applicant } = await TestClientGenerator.applicant({
        status: ApprovalStatus.approved,
        careers: [
          {
            careerCode: secondCareer.code,
            isGraduate: false,
            currentCareerYear: 4,
            approvedSubjectCount: 33
          }
        ]
      });
      const offer = await OfferGenerator.instance.forStudents({
        companyUuid: company.uuid,
        status: ApprovalStatus.approved
      });
      await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });

      const jobApplication = await JobApplicationRepository.findByApplicantAndOffer(
        applicant,
        offer
      );
      jobApplication.set({ approvalStatus: ApprovalStatus.approved });
      await JobApplicationRepository.save(jobApplication);

      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });

      expect(errors).toEqualGraphQLErrorType("JobApplicationAlreadyExistsError");
    });

    it("returns an error if the offer does not exist", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: ApprovalStatus.approved
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da" }
      });

      expect(errors).toEqualGraphQLErrorType(OfferNotFoundError.name);
    });
  });
});
