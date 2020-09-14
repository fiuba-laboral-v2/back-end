import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { CompanyRepository } from "$models/Company";
import { OfferRepository } from "$models/Offer";
import { JobApplicationNotFoundError, JobApplicationRepository } from "$models/JobApplication";
import { Admin, Applicant, Company, JobApplication, Offer } from "$models";
import { UserRepository } from "$models/User";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { OfferGenerator } from "$generators/Offer";
import { AdminGenerator } from "$generators/Admin";
import MockDate from "mockdate";
import { range } from "lodash";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";

describe("JobApplicationRepository", () => {
  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  describe("Apply", () => {
    it("applies to a new jobApplication", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const company = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
      const jobApplication = await JobApplicationRepository.apply(applicant.uuid, offer);
      expect(jobApplication).toMatchObject({
        offerUuid: offer.uuid,
        applicantUuid: applicant.uuid
      });
    });

    it("applies to a new jobApplication and approval status is pending", async () => {
      const { uuid: applicantUuid } = await ApplicantGenerator.instance.withMinimumData();
      const company = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
      const jobApplication = await JobApplicationRepository.apply(applicantUuid, offer);
      expect(jobApplication).toMatchObject({ approvalStatus: ApprovalStatus.pending });
    });

    it("creates four valid jobApplications for for the same offer", async () => {
      const applicant1 = await ApplicantGenerator.instance.withMinimumData();
      const applicant2 = await ApplicantGenerator.instance.withMinimumData();
      const applicant3 = await ApplicantGenerator.instance.withMinimumData();
      const applicant4 = await ApplicantGenerator.instance.withMinimumData();
      const company = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
      await expect(
        Promise.all([
          JobApplicationRepository.apply(applicant1.uuid, offer),
          JobApplicationRepository.apply(applicant2.uuid, offer),
          JobApplicationRepository.apply(applicant3.uuid, offer),
          JobApplicationRepository.apply(applicant4.uuid, offer)
        ])
      ).resolves.not.toThrow();
    });

    it("throws an error if given applicantUuid that does not exist", async () => {
      const company = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
      const notExistingApplicantUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      await expect(
        JobApplicationRepository.apply(notExistingApplicantUuid, offer)
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
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      await JobApplicationRepository.apply(applicant.uuid, offer);
      await expect(
        JobApplicationRepository.apply(applicant.uuid, offer)
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });
  });

  describe("Associations", () => {
    it("gets Applicant and offer from a jobApplication", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      const jobApplication = await JobApplicationRepository.apply(applicant.uuid, offer);
      const offer1 = (await jobApplication.getOffer()).toJSON();
      expect((await jobApplication.getApplicant()).toJSON()).toMatchObject(applicant.toJSON());
      expect(offer1).toMatchObject(offer.toJSON());
    });

    it("gets all applicant's jobApplications", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      const jobApplication = await JobApplicationRepository.apply(applicant.uuid, offer);
      expect(
        (await applicant.getJobApplications()).map(aJobApplication => aJobApplication.toJSON())
      ).toEqual([jobApplication.toJSON()]);
    });
  });

  describe("hasApplied", () => {
    it("returns true if applicant applied for offer", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      await JobApplicationRepository.apply(applicant.uuid, offer);
      expect(await JobApplicationRepository.hasApplied(applicant, offer)).toBe(true);
    });

    it("should return false if applicant has not applied to the offer", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      expect(await JobApplicationRepository.hasApplied(applicant, offer)).toBe(false);
    });
  });

  describe("findLatestByCompanyUuid", () => {
    it("returns the only application for my company", async () => {
      const { uuid: applicantUuid } = await ApplicantGenerator.instance.withMinimumData();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      await JobApplicationRepository.apply(applicantUuid, offer);
      const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid({
        companyUuid: companyUuid
      });
      expect(jobApplications.shouldFetchMore).toEqual(false);
      expect(jobApplications.results).toMatchObject([
        {
          offerUuid: offer.uuid,
          applicantUuid: applicantUuid
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
      const { uuid: applicantUuid } = await ApplicantGenerator.instance.withMinimumData();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const anotherCompany = await CompanyGenerator.instance.withMinimumData();
      const myOffer1 = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      const myOffer2 = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      const notMyOffer = await OfferGenerator.instance.withObligatoryData({
        companyUuid: anotherCompany.uuid
      });

      await JobApplicationRepository.apply(applicantUuid, myOffer1);
      await JobApplicationRepository.apply(applicantUuid, myOffer2);
      await JobApplicationRepository.apply(applicantUuid, notMyOffer);
      const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid({
        companyUuid: companyUuid
      });
      expect(jobApplications.shouldFetchMore).toEqual(false);
      expect(jobApplications.results).toMatchObject([
        {
          offerUuid: myOffer2.uuid,
          applicantUuid,
          approvalStatus: ApprovalStatus.pending
        },
        {
          offerUuid: myOffer1.uuid,
          applicantUuid,
          approvalStatus: ApprovalStatus.pending
        }
      ]);
    });

    describe("when there are applications with equal updatedAt", () => {
      const updatedAt = new Date();
      let company: Company;
      const newOffers: Offer[] = [];

      beforeAll(async () => {
        JobApplicationRepository.truncate();

        MockDate.set(updatedAt);

        company = await CompanyGenerator.instance.withMinimumData();
        const applicant = await ApplicantGenerator.instance.withMinimumData();
        for (const _ of range(10)) {
          const offer = await OfferGenerator.instance.withObligatoryData({
            companyUuid: company.uuid
          });
          await JobApplicationRepository.apply(applicant.uuid, offer);
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
        const offer = await OfferGenerator.instance.withObligatoryData({
          companyUuid: company.uuid
        });
        for (const _ of range(10)) {
          const applicant = await ApplicantGenerator.instance.withMinimumData();
          await JobApplicationRepository.apply(applicant.uuid, offer);
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
