import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { OfferRepository } from "$models/Offer";
import { ApplicantType } from "$models/Applicant";
import {
  JobApplicationRepository,
  JobApplicationNotFoundError,
  OfferNotTargetedForApplicantError
} from "$models/JobApplication";
import { Admin, Applicant, Company, JobApplication, Offer } from "$models";
import { UserRepository } from "$models/User";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { OfferGenerator } from "$generators/Offer";
import { AdminGenerator } from "$generators/Admin";
import { range } from "lodash";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

describe("JobApplicationRepository", () => {
  let student: Applicant;
  let graduate: Applicant;
  let studentAndGraduate: Applicant;
  let offerForStudents: Offer;
  let offerForGraduates: Offer;
  let offerForStudentsAndGraduates: Offer;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await CareerRepository.truncate();
    const company = await CompanyGenerator.instance.withMinimumData();
    student = await ApplicantGenerator.instance.student();
    graduate = await ApplicantGenerator.instance.graduate();
    studentAndGraduate = await ApplicantGenerator.instance.studentAndGraduate();

    offerForStudents = await OfferGenerator.instance.forStudents({ companyUuid: company.uuid });
    offerForGraduates = await OfferGenerator.instance.forGraduates({ companyUuid: company.uuid });
    offerForStudentsAndGraduates = await OfferGenerator.instance.forStudentsAndGraduates({
      companyUuid: company.uuid
    });
  });

  describe("Apply", () => {
    const expectToApply = async (applicant: Applicant, offer: Offer) => {
      const jobApplication = await JobApplicationRepository.apply(applicant, offer);
      expect(jobApplication).toBeObjectContaining({
        offerUuid: offer.uuid,
        applicantUuid: applicant.uuid,
        approvalStatus: ApprovalStatus.pending
      });
    };

    it("student applies to an offer for students", async () => {
      await expectToApply(student, offerForStudents);
    });

    it("student applies to an offer for students and graduates", async () => {
      await expectToApply(student, offerForStudentsAndGraduates);
    });

    it("graduate applies to an offer for graduates", async () => {
      await expectToApply(graduate, offerForGraduates);
    });

    it("graduate applies to an offer for graduates and students", async () => {
      await expectToApply(graduate, offerForStudentsAndGraduates);
    });

    it("student and graduate applies to an offer for graduates", async () => {
      await expectToApply(studentAndGraduate, offerForGraduates);
    });

    it("student and graduate applies to an offer for students", async () => {
      await expectToApply(studentAndGraduate, offerForStudents);
    });

    it("student and graduate applies to an offer for students and graduates", async () => {
      await expectToApply(studentAndGraduate, offerForStudentsAndGraduates);
    });

    it("throws an error if a student applies to an offer for graduates", async () => {
      await expect(
        JobApplicationRepository.apply(student, offerForGraduates)
      ).rejects.toThrowErrorWithMessage(
        OfferNotTargetedForApplicantError,
        OfferNotTargetedForApplicantError.buildMessage(
          await student.getType(),
          offerForGraduates.targetApplicantType
        )
      );
    });

    it("throws an error if graduate applies to an offer for students", async () => {
      await expect(
        JobApplicationRepository.apply(graduate, offerForStudents)
      ).rejects.toThrowErrorWithMessage(
        OfferNotTargetedForApplicantError,
        OfferNotTargetedForApplicantError.buildMessage(
          await graduate.getType(),
          offerForStudents.targetApplicantType
        )
      );
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
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      await JobApplicationRepository.apply(applicant, offerForGraduates);
      await expect(
        JobApplicationRepository.apply(applicant, offerForGraduates)
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });
  });

  describe("Associations", () => {
    it("gets Applicant and offer from a jobApplication", async () => {
      const applicant = await ApplicantGenerator.instance.graduate();
      const jobApplication = await JobApplicationRepository.apply(applicant, offerForGraduates);
      expect((await jobApplication.getApplicant()).toJSON()).toMatchObject(applicant.toJSON());
      expect((await jobApplication.getOffer()).toJSON()).toMatchObject(offerForGraduates.toJSON());
    });

    it("gets all applicant's jobApplications", async () => {
      const graduateApplicant = await ApplicantGenerator.instance.graduate();
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
      const { uuid: companyUuid } = await CompanyGenerator.instance.withCompleteData();
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
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
      const myOffer1 = await OfferGenerator.instance.forStudents({ companyUuid });
      const myOffer2 = await OfferGenerator.instance.forGraduates({ companyUuid });
      const notMyOffer = await OfferGenerator.instance.forStudentsAndGraduates({
        companyUuid: anotherCompany.uuid
      });

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
          approvalStatus: ApprovalStatus.pending
        }),
        expect.objectContaining({
          offerUuid: myOffer1.uuid,
          applicantUuid: studentAndGraduate.uuid,
          approvalStatus: ApprovalStatus.pending
        })
      ]);
    });

    describe("fetchMore", () => {
      let jobApplicationsByDescUpdatedAt: JobApplication[] = [];
      let company: Company;

      beforeAll(async () => {
        await JobApplicationRepository.truncate();

        company = await CompanyGenerator.instance.withCompleteData();
        for (const _ of range(15)) {
          jobApplicationsByDescUpdatedAt.push(
            await JobApplicationGenerator.instance.toTheCompany(company.uuid)
          );
        }
        jobApplicationsByDescUpdatedAt = jobApplicationsByDescUpdatedAt.sort(
          jobApplication => -jobApplication.updatedAt
        );
      });

      it("gets the next 3 jobApplications", async () => {
        const itemsPerPage = 3;
        const lastIndex = 9;
        mockItemsPerPage(itemsPerPage);

        const lastJobApplication = jobApplicationsByDescUpdatedAt[lastIndex];
        const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid({
          companyUuid: company.uuid,
          updatedBeforeThan: {
            dateTime: lastJobApplication.updatedAt,
            uuid: lastJobApplication.uuid
          }
        });
        expect(jobApplications.results.map(j => j.uuid)).toEqual(
          jobApplicationsByDescUpdatedAt
            .slice(lastIndex + 1, lastIndex + 1 + itemsPerPage)
            .map(offer => offer.uuid)
        );

        expect(jobApplications.shouldFetchMore).toBe(true);
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
    const expectStatusToBe = async (status: ApprovalStatus, secretary: Secretary) => {
      const admin = await AdminGenerator.instance({ secretary });
      const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
      const jobApplication = await JobApplicationRepository.updateApprovalStatus({
        admin,
        uuid,
        status
      });
      expect(jobApplication.approvalStatus).toEqual(status);
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

    it("allows graduados admin to change status to pending", async () => {
      await expectStatusToBe(ApprovalStatus.pending, Secretary.graduados);
    });

    it("allows graduados admin to change status to approved", async () => {
      await expectStatusToBe(ApprovalStatus.approved, Secretary.graduados);
    });

    it("allows graduados admin to change status to rejected", async () => {
      await expectStatusToBe(ApprovalStatus.rejected, Secretary.graduados);
    });

    it("allows extension admin to change status to pending", async () => {
      await expectStatusToBe(ApprovalStatus.pending, Secretary.extension);
    });

    it("allows extension admin to change status to approved", async () => {
      await expectStatusToBe(ApprovalStatus.approved, Secretary.extension);
    });

    it("allows extension admin to change status to rejected", async () => {
      await expectStatusToBe(ApprovalStatus.rejected, Secretary.extension);
    });

    it("logs an event after an extension admin sets status to pending", async () => {
      await expectToLogAnEventForStatus(Secretary.extension, ApprovalStatus.pending);
    });

    it("logs an event after an extension admin sets status to approved", async () => {
      await expectToLogAnEventForStatus(Secretary.extension, ApprovalStatus.approved);
    });

    it("logs an event after an extension admin sets status to rejected", async () => {
      await expectToLogAnEventForStatus(Secretary.extension, ApprovalStatus.rejected);
    });

    it("logs an event after an graduados admin sets status to pending", async () => {
      await expectToLogAnEventForStatus(Secretary.graduados, ApprovalStatus.pending);
    });

    it("logs an event after an graduados admin sets status to approved", async () => {
      await expectToLogAnEventForStatus(Secretary.graduados, ApprovalStatus.approved);
    });

    it("logs an event after an graduados admin sets status to rejected", async () => {
      await expectToLogAnEventForStatus(Secretary.graduados, ApprovalStatus.rejected);
    });

    it("throws an error if the jobApplication does not exist", async () => {
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

    it("throws an error if the admin does not exist", async () => {
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
      const { approvalStatus } = await JobApplicationRepository.findByUuid(uuid);
      expect(approvalStatus).toEqual(ApprovalStatus.pending);
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
      const { approvalStatus } = await JobApplicationRepository.findByUuid(uuid);
      expect(approvalStatus).toEqual(ApprovalStatus.pending);
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
