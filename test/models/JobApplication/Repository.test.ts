import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { ApplicantType, OfferRepository } from "$models/Offer";
import { JobApplicationNotFoundError, JobApplicationRepository } from "$models/JobApplication";
import { Admin, Applicant, Career, Company, JobApplication, Offer } from "$models";
import { UserRepository } from "$models/User";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { OfferGenerator } from "$generators/Offer";
import { AdminGenerator } from "$generators/Admin";
import { CareerGenerator } from "$generators/Career";
import MockDate from "mockdate";
import { range } from "lodash";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { IApplicantCareer } from "$models/Applicant/ApplicantCareer";

describe("JobApplicationRepository", () => {
  let extensionAdmin: Admin;
  let firstCareer: Career;
  let secondCareer: Career;
  let student: Applicant;
  let graduate: Applicant;
  let studentAndGraduate: Applicant;
  let offerForStudents: Offer;
  let offerForGraduates: Offer;
  let offerForStudentsAndGraduates: Offer;

  const createOfferFor = async (
    targetApplicantType: ApplicantType,
    status: ApprovalStatus,
    companyUuid?: string
  ) => {
    const { uuid } = await OfferRepository.create(
      OfferGenerator.data.withObligatoryData({
        companyUuid: companyUuid
          ? companyUuid
          : (await CompanyGenerator.instance.withMinimumData()).uuid,
        targetApplicantType
      })
    );
    return await OfferRepository.updateApprovalStatus({ uuid, status, admin: extensionAdmin });
  };

  const createApplicantInTheCareers = async (careers: IApplicantCareer[]) =>
    ApplicantGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.approved,
      admin: extensionAdmin,
      careers
    });

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await CareerRepository.truncate();
    extensionAdmin = await AdminGenerator.instance({ secretary: Secretary.extension });
    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();
    student = await createApplicantInTheCareers([
      {
        careerCode: firstCareer.code,
        approvedSubjectCount: 40,
        isGraduate: false,
        currentCareerYear: 5
      }
    ]);
    graduate = await createApplicantInTheCareers([
      {
        careerCode: firstCareer.code,
        isGraduate: true
      }
    ]);
    studentAndGraduate = await createApplicantInTheCareers([
      {
        careerCode: firstCareer.code,
        approvedSubjectCount: 40,
        isGraduate: false,
        currentCareerYear: 5
      },
      {
        careerCode: secondCareer.code,
        isGraduate: true
      }
    ]);
    offerForStudents = await createOfferFor(ApplicantType.student, ApprovalStatus.approved);
    offerForGraduates = await createOfferFor(ApplicantType.graduate, ApprovalStatus.approved);
    offerForStudentsAndGraduates = await createOfferFor(
      ApplicantType.both,
      ApprovalStatus.approved
    );
  });

  describe("Apply", () => {
    it("applies to a new jobApplication", async () => {
      const jobApplication = await JobApplicationRepository.apply(student, offerForStudents);
      expect(jobApplication).toMatchObject({
        offerUuid: offerForStudents.uuid,
        applicantUuid: student.uuid
      });
    });

    it("applies to a new jobApplication and both status are in pending", async () => {
      const jobApplication = await JobApplicationRepository.apply(graduate, offerForGraduates);
      expect(jobApplication).toMatchObject({
        extensionApprovalStatus: ApprovalStatus.pending,
        graduadosApprovalStatus: ApprovalStatus.pending
      });
    });

    it("creates three valid jobApplications for for the same offer", async () => {
      await expect(
        Promise.all([
          JobApplicationRepository.apply(student, offerForStudentsAndGraduates),
          JobApplicationRepository.apply(graduate, offerForStudentsAndGraduates),
          JobApplicationRepository.apply(studentAndGraduate, offerForStudentsAndGraduates)
        ])
      ).resolves.not.toThrow();
    });

    it("throws an error if given applicantUuid that does not exist", async () => {
      const applicant = new Applicant();
      jest.spyOn(applicant, "getType").mockResolvedValueOnce(ApplicantType.student);
      jest.spyOn(offerForStudents, "applicantCanApply").mockResolvedValueOnce(true);
      await expect(
        JobApplicationRepository.apply(applicant, offerForStudents)
      ).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "JobApplications" violates foreign key ' +
          'constraint "JobApplications_applicantUuid_fkey"'
      );
    });

    it("throws an error if given offerUuid that does not exist", async () => {
      const { uuid: applicantUuid } = await ApplicantGenerator.instance.withMinimumData();
      const jobApplication = new JobApplication({
        offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        applicantUuid
      });
      await expect(jobApplication.save()).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "JobApplications" violates foreign key ' +
          'constraint "JobApplications_offerUuid_fkey"'
      );
    });

    it("throws an error if jobApplication already exists", async () => {
      await JobApplicationRepository.apply(studentAndGraduate, offerForGraduates);
      await expect(
        JobApplicationRepository.apply(studentAndGraduate, offerForGraduates)
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });
  });

  describe("Associations", () => {
    it("gets Applicant and offer from a jobApplication", async () => {
      const applicant = await createApplicantInTheCareers([
        { careerCode: firstCareer.code, isGraduate: true }
      ]);
      const jobApplication = await JobApplicationRepository.apply(applicant, offerForGraduates);
      expect((await jobApplication.getApplicant()).toJSON()).toMatchObject(applicant.toJSON());
      expect((await jobApplication.getOffer()).toJSON()).toMatchObject(offerForGraduates.toJSON());
    });

    it("gets all applicant's jobApplications", async () => {
      const graduateApplicant = await createApplicantInTheCareers([
        { careerCode: firstCareer.code, isGraduate: true }
      ]);
      const jobApplication = await JobApplicationRepository.apply(
        graduateApplicant,
        offerForGraduates
      );
      const applicantsJobApplications = await graduateApplicant.getJobApplications();
      expect(applicantsJobApplications.map(aJobApplication => aJobApplication.toJSON())).toEqual([
        jobApplication.toJSON()
      ]);
    });
  });

  describe("hasApplied", () => {
    it("returns true if applicant applied for offer", async () => {
      const applicant = await ApplicantGenerator.instance.graduate();
      await JobApplicationRepository.apply(applicant, offerForStudentsAndGraduates);
      expect(
        await JobApplicationRepository.hasApplied(applicant, offerForStudentsAndGraduates)
      ).toBe(true);
    });

    it("returns false if applicant has not applied to the offer", async () => {
      const applicant = await ApplicantGenerator.instance.graduate();
      expect(await JobApplicationRepository.hasApplied(applicant, offerForGraduates)).toBe(false);
    });
  });

  describe("findLatestByCompanyUuid", () => {
    it("returns the only application for my company", async () => {
      const offer = await createOfferFor(ApplicantType.student, ApprovalStatus.approved);
      await JobApplicationRepository.apply(studentAndGraduate, offer);
      const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid({
        companyUuid: offer.companyUuid
      });
      expect(jobApplications.shouldFetchMore).toEqual(false);
      expect(jobApplications.results).toMatchObject([
        {
          offerUuid: offer.uuid,
          applicantUuid: studentAndGraduate.uuid
        }
      ]);
    });

    it("returns no job applications if my company has any", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid({
        companyUuid
      });
      expect(jobApplications.results).toHaveLength(0);
      expect(jobApplications.shouldFetchMore).toEqual(false);
    });

    it("returns the latest job applications first for my company", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const anotherCompany = await CompanyGenerator.instance.withMinimumData();
      const myOffer1 = await createOfferFor(
        ApplicantType.student,
        ApprovalStatus.approved,
        companyUuid
      );
      const myOffer2 = await createOfferFor(
        ApplicantType.graduate,
        ApprovalStatus.approved,
        companyUuid
      );
      const notMyOffer = await createOfferFor(
        ApplicantType.both,
        ApprovalStatus.approved,
        anotherCompany.uuid
      );

      await JobApplicationRepository.apply(studentAndGraduate, myOffer1);
      await JobApplicationRepository.apply(studentAndGraduate, myOffer2);
      await JobApplicationRepository.apply(studentAndGraduate, notMyOffer);
      const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid({
        companyUuid: companyUuid
      });
      expect(jobApplications.shouldFetchMore).toEqual(false);
      expect(jobApplications.results).toEqual([
        expect.objectContaining({
          offerUuid: myOffer2.uuid,
          applicantUuid: studentAndGraduate.uuid,
          extensionApprovalStatus: ApprovalStatus.pending,
          graduadosApprovalStatus: ApprovalStatus.pending
        }),
        expect.objectContaining({
          offerUuid: myOffer1.uuid,
          applicantUuid: studentAndGraduate.uuid,
          extensionApprovalStatus: ApprovalStatus.pending,
          graduadosApprovalStatus: ApprovalStatus.pending
        })
      ]);
    });

    describe("when there are applications with equal updatedAt", () => {
      const updatedAt = new Date();
      let company: Company;
      const newOffers: Offer[] = [];

      beforeAll(async () => {
        await JobApplicationRepository.truncate();

        MockDate.set(updatedAt);

        company = await CompanyGenerator.instance.withMinimumData();
        const applicant = await ApplicantGenerator.instance.graduate();
        for (const _ of range(10)) {
          const offer = await OfferGenerator.instance.withObligatoryData({
            companyUuid: company.uuid
          });
          await JobApplicationRepository.apply(applicant, offer);
          newOffers.push(offer);
        }

        MockDate.reset();
      });

      it("sorts by offerUuid", async () => {
        const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid({
          companyUuid: company.uuid
        });
        expect(jobApplications.shouldFetchMore).toEqual(false);
        expect(jobApplications.results.map(result => result.offerUuid)).toMatchObject(
          newOffers
            .map(offer => offer.uuid)
            .sort()
            .reverse()
        );
      });
    });

    describe("when there are applications with equal updatedAt and offerUuid", () => {
      const updatedAt = new Date();
      let company: Company;
      const newApplicants: Applicant[] = [];

      beforeAll(async () => {
        JobApplicationRepository.truncate();

        MockDate.set(updatedAt);

        company = await CompanyGenerator.instance.withMinimumData();
        const offer = await createOfferFor(
          ApplicantType.both,
          ApprovalStatus.approved,
          company.uuid
        );
        for (const _ of range(10)) {
          const applicant = await ApplicantGenerator.instance.graduate();
          await JobApplicationRepository.apply(applicant, offer);
          newApplicants.push(applicant);
        }

        MockDate.reset();
      });

      it("sorts by applicantUuid", async () => {
        const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid({
          companyUuid: company.uuid
        });
        expect(jobApplications.shouldFetchMore).toEqual(false);
        expect(jobApplications.results.map(result => result.applicantUuid)).toMatchObject(
          newApplicants
            .map(applicant => applicant.uuid)
            .sort()
            .reverse()
        );
      });
    });
  });

  describe("findByUuid", () => {
    it("return a jobApplication By Uuid", async () => {
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      expect((await JobApplicationRepository.findByUuid(jobApplication.uuid)).toJSON()).toEqual(
        jobApplication.toJSON()
      );
    });

    it("throws an error if jobApplication does not exist", async () => {
      const nonExistentJobApplicationUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      await expect(
        JobApplicationRepository.findByUuid(nonExistentJobApplicationUuid)
      ).rejects.toThrowErrorWithMessage(
        JobApplicationNotFoundError,
        JobApplicationNotFoundError.buildMessage(nonExistentJobApplicationUuid)
      );
    });
  });

  describe("updateApprovalStatus", () => {
    const expectStatusToBe = async (
      status: ApprovalStatus,
      secretary: Secretary,
      statusColumn: string
    ) => {
      const admin = await AdminGenerator.instance({ secretary });
      const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
      const jobApplication = await JobApplicationRepository.updateApprovalStatus({
        admin,
        uuid,
        status
      });
      expect(jobApplication[statusColumn]).toEqual(status);
    };

    const expectToLogAnEventForStatus = async (secretary: Secretary, status: ApprovalStatus) => {
      const admin = await AdminGenerator.instance({ secretary });
      const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
      const jobApplication = await JobApplicationRepository.updateApprovalStatus({
        admin,
        uuid,
        status
      });
      expect(await jobApplication.getApprovalEvents()).toEqual([
        expect.objectContaining({
          adminUserUuid: admin.userUuid,
          jobApplicationUuid: jobApplication.uuid,
          status
        })
      ]);
    };

    it("sets to pending the jobApplication by graduados secretary", async () => {
      await expectStatusToBe(
        ApprovalStatus.pending,
        Secretary.graduados,
        "graduadosApprovalStatus"
      );
    });

    it("approves the jobApplication by graduados secretary", async () => {
      await expectStatusToBe(
        ApprovalStatus.approved,
        Secretary.graduados,
        "graduadosApprovalStatus"
      );
    });

    it("rejects the jobApplication by graduados secretary", async () => {
      await expectStatusToBe(
        ApprovalStatus.rejected,
        Secretary.graduados,
        "graduadosApprovalStatus"
      );
    });

    it("sets to pending the jobApplication by extension secretary", async () => {
      await expectStatusToBe(
        ApprovalStatus.pending,
        Secretary.extension,
        "extensionApprovalStatus"
      );
    });

    it("approved the jobApplication by extension secretary", async () => {
      await expectStatusToBe(
        ApprovalStatus.approved,
        Secretary.extension,
        "extensionApprovalStatus"
      );
    });

    it("rejects the jobApplication by extension secretary", async () => {
      await expectStatusToBe(
        ApprovalStatus.approved,
        Secretary.extension,
        "extensionApprovalStatus"
      );
    });

    it("logs an event after setting to pending the extension secretary status", async () => {
      await expectToLogAnEventForStatus(Secretary.extension, ApprovalStatus.pending);
    });

    it("logs an event after setting to approved the extension secretary status", async () => {
      await expectToLogAnEventForStatus(Secretary.extension, ApprovalStatus.approved);
    });

    it("logs an event after setting to rejected the extension secretary status", async () => {
      await expectToLogAnEventForStatus(Secretary.extension, ApprovalStatus.rejected);
    });

    it("logs an event after setting to pending the graduados secretary status", async () => {
      await expectToLogAnEventForStatus(Secretary.graduados, ApprovalStatus.pending);
    });

    it("logs an event after setting to approved the graduados secretary status", async () => {
      await expectToLogAnEventForStatus(Secretary.graduados, ApprovalStatus.approved);
    });

    it("logs an event after setting to rejected the graduados secretary status", async () => {
      await expectToLogAnEventForStatus(Secretary.graduados, ApprovalStatus.rejected);
    });

    it("throws an error if the jobApplication does not exists", async () => {
      const secretary = Secretary.extension;
      const admin = await AdminGenerator.instance({ secretary });
      const nonExistentJobApplicationUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      await expect(
        JobApplicationRepository.updateApprovalStatus({
          admin,
          uuid: nonExistentJobApplicationUuid,
          status: ApprovalStatus.approved
        })
      ).rejects.toThrowErrorWithMessage(
        JobApplicationNotFoundError,
        JobApplicationNotFoundError.buildMessage(nonExistentJobApplicationUuid)
      );
    });

    it("throws an error if the admin does not exists", async () => {
      const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
      const notPersistedAdmin = new Admin({
        userUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        secretary: Secretary.extension
      });
      await expect(
        JobApplicationRepository.updateApprovalStatus({
          admin: notPersistedAdmin,
          uuid,
          status: ApprovalStatus.approved
        })
      ).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "JobApplicationApprovalEvent" violates ' +
          'foreign key constraint "JobApplicationApprovalEvent_adminUserUuid_fkey"'
      );
    });

    it("throws an error if status is invalid and does not update the jobApplication", async () => {
      const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
      const admin = await AdminGenerator.instance({ secretary: Secretary.extension });
      await expect(
        JobApplicationRepository.updateApprovalStatus({
          admin,
          uuid,
          status: "invalidStatus" as ApprovalStatus
        })
      ).rejects.toThrow();
      const { extensionApprovalStatus } = await JobApplicationRepository.findByUuid(uuid);
      expect(extensionApprovalStatus).toEqual(ApprovalStatus.pending);
    });

    it("fails logging event and does not update jobApplication", async () => {
      const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
      const notPersistedAdmin = new Admin({
        userUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        secretary: Secretary.extension
      });
      await expect(
        JobApplicationRepository.updateApprovalStatus({
          admin: notPersistedAdmin,
          uuid,
          status: ApprovalStatus.approved
        })
      ).rejects.toThrow();
      const { extensionApprovalStatus } = await JobApplicationRepository.findByUuid(uuid);
      expect(extensionApprovalStatus).toEqual(ApprovalStatus.pending);
    });
  });

  describe("Delete", () => {
    it("deletes all jobApplications", async () => {
      await JobApplicationRepository.truncate();
      await JobApplicationGenerator.instance.withMinimumData();
      await JobApplicationGenerator.instance.withMinimumData();
      expect(await JobApplication.findAll()).toHaveLength(2);
      await JobApplicationRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });

    it("deletes all jobApplication if all offers are deleted", async () => {
      await JobApplicationRepository.truncate();
      await JobApplicationGenerator.instance.withMinimumData();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await OfferRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });

    it("deletes all jobApplication if all applicants are deleted", async () => {
      await JobApplicationRepository.truncate();
      await JobApplicationGenerator.instance.withMinimumData();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await UserRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });

    it("deletes all jobApplication if all companies are deleted", async () => {
      await JobApplicationRepository.truncate();
      await JobApplicationGenerator.instance.withMinimumData();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await CompanyRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });
  });
});
