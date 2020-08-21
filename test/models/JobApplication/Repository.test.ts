import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { CompanyRepository } from "$models/Company";
import { OfferRepository } from "$models/Offer";
import { JobApplicationNotFoundError, JobApplicationRepository } from "$models/JobApplication";
import { Applicant, Company, JobApplication, Offer } from "$models";
import { UserRepository } from "$models/User";
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

  const createJobApplication = async () => {
    const applicant = await ApplicantGenerator.instance.withMinimumData();
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
    return JobApplicationRepository.apply(applicant.uuid, offer);
  };

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

    it("applies to a new jobApplication and both status are in pending", async () => {
      const { uuid: applicantUuid } = await ApplicantGenerator.instance.withMinimumData();
      const company = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
      const jobApplication = await JobApplicationRepository.apply(applicantUuid, offer);
      expect(jobApplication).toMatchObject({
        extensionApprovalStatus: ApprovalStatus.pending,
        graduadosApprovalStatus: ApprovalStatus.pending
      });
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
          extensionApprovalStatus: ApprovalStatus.pending,
          graduadosApprovalStatus: ApprovalStatus.pending
        },
        {
          offerUuid: myOffer1.uuid,
          applicantUuid,
          extensionApprovalStatus: ApprovalStatus.pending,
          graduadosApprovalStatus: ApprovalStatus.pending
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

  describe("updateApprovalStatus", () => {
    const expectStatusToBe = async (
      status: ApprovalStatus,
      secretary: Secretary,
      statusColumn: string
    ) => {
      const { userUuid: adminUserUuid } = await AdminGenerator.instance({ secretary });
      const { offerUuid, applicantUuid } = await createJobApplication();
      const jobApplication = await JobApplicationRepository.updateApprovalStatus({
        adminUserUuid,
        offerUuid,
        applicantUuid,
        status,
        secretary
      });
      expect(jobApplication[statusColumn]).toEqual(status);
    };

    const expectToLogAnEventForStatus = async (secretary: Secretary, status: ApprovalStatus) => {
      const { userUuid: adminUserUuid } = await AdminGenerator.instance({ secretary });
      const { offerUuid, applicantUuid } = await createJobApplication();
      const jobApplication = await JobApplicationRepository.updateApprovalStatus({
        adminUserUuid,
        offerUuid,
        applicantUuid,
        status,
        secretary
      });
      expect(await jobApplication.getApprovalEvents()).toEqual([
        expect.objectContaining({
          adminUserUuid,
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

    it("throws an error if the offer does not exists", async () => {
      const { userUuid: adminUserUuid } = await AdminGenerator.instance({
        secretary: Secretary.extension
      });
      const { uuid: applicantUuid } = await ApplicantGenerator.instance.withMinimumData();
      const nonExistentOfferUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      await expect(
        JobApplicationRepository.updateApprovalStatus({
          adminUserUuid,
          offerUuid: nonExistentOfferUuid,
          applicantUuid,
          status: ApprovalStatus.approved,
          secretary: Secretary.extension
        })
      ).rejects.toThrowErrorWithMessage(
        JobApplicationNotFoundError,
        JobApplicationNotFoundError.buildMessage(nonExistentOfferUuid, applicantUuid)
      );
    });

    it("throws an error if the applicant does not exists", async () => {
      const { userUuid: adminUserUuid, secretary } = await AdminGenerator.instance({
        secretary: Secretary.extension
      });
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const { uuid: offerUuid } = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      const nonExistentApplicantUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      await expect(
        JobApplicationRepository.updateApprovalStatus({
          adminUserUuid,
          offerUuid,
          applicantUuid: nonExistentApplicantUuid,
          status: ApprovalStatus.approved,
          secretary
        })
      ).rejects.toThrowErrorWithMessage(
        JobApplicationNotFoundError,
        JobApplicationNotFoundError.buildMessage(offerUuid, nonExistentApplicantUuid)
      );
    });

    it("throws an error if the admin does not exists", async () => {
      const { offerUuid, applicantUuid } = await createJobApplication();
      const nonExistentAdminUserUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      await expect(
        JobApplicationRepository.updateApprovalStatus({
          adminUserUuid: nonExistentAdminUserUuid,
          offerUuid,
          applicantUuid,
          status: ApprovalStatus.approved,
          secretary: Secretary.extension
        })
      ).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "JobApplicationApprovalEvent" violates ' +
          'foreign key constraint "JobApplicationApprovalEvent_adminUserUuid_fkey"'
      );
    });
  });

  describe("Delete", () => {
    it("deletes all jobApplications", async () => {
      await JobApplicationRepository.truncate();
      await createJobApplication();
      await createJobApplication();
      expect(await JobApplication.findAll()).toHaveLength(2);
      await JobApplicationRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });

    it("deletes all jobApplication if all offers are deleted", async () => {
      await JobApplicationRepository.truncate();
      await createJobApplication();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await OfferRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });

    it("deletes all jobApplication if all applicants are deleted", async () => {
      await JobApplicationRepository.truncate();
      await createJobApplication();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await UserRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });

    it("deletes all jobApplication if all companies are deleted", async () => {
      await JobApplicationRepository.truncate();
      await createJobApplication();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await CompanyRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });
  });
});
