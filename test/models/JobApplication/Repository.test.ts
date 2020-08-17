import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { CompanyRepository } from "$models/Company";
import { OfferRepository } from "$models/Offer";
import { JobApplicationRepository } from "$models/JobApplication";
import { JobApplication } from "$models";
import { UserRepository } from "$models/User";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { OfferGenerator } from "$generators/Offer";

describe("JobApplicationRepository", () => {
  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  describe("Apply", () => {
    it("should apply to a new jobApplication", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const company = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
      const jobApplication = await JobApplicationRepository.apply(applicant.uuid, offer);
      expect(jobApplication).toMatchObject({
        offerUuid: offer.uuid,
        applicantUuid: applicant.uuid
      });
    });

    it("should create four valid jobApplications for for the same offer", async () => {
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

    it("should throw an error if given applicantUuid that does not exist", async () => {
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

    it("should throw an error if given offerUuid that does not exist", async () => {
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

    it("should throw an error if jobApplication already exists", async () => {
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
    it("should get Applicant and offer from a jobApplication", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      const jobApplication = await JobApplicationRepository.apply(applicant.uuid, offer);
      const offer1 = (await jobApplication.getOffer()).toJSON();
      expect((await jobApplication.getApplicant()).toJSON()).toMatchObject(applicant.toJSON());
      expect(offer1).toMatchObject(offer.toJSON());
    });

    it("should get all applicant's jobApplications", async () => {
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
    it("should return true if applicant applied for offer", async () => {
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
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      await JobApplicationRepository.apply(applicant.uuid, offer);
      const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid(companyUuid);
      expect(jobApplications.length).toEqual(1);
      expect(jobApplications).toMatchObject([
        {
          offerUuid: offer.uuid,
          applicantUuid: applicant.uuid
        }
      ]);
    });

    it("returns no job applications if my company has any", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid(companyUuid);
      expect(jobApplications.length).toEqual(0);
    });

    it("returns the latest job applications first for my company", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const anotherCompany = await CompanyGenerator.instance.withMinimumData();
      const myOffer1 = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      const myOffer2 = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      const notMyOffer = await OfferGenerator.instance.withObligatoryData({
        companyUuid: anotherCompany.uuid
      });

      await JobApplicationRepository.apply(applicant.uuid, myOffer1);
      await JobApplicationRepository.apply(applicant.uuid, myOffer2);
      await JobApplicationRepository.apply(applicant.uuid, notMyOffer);
      const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid(companyUuid);
      expect(jobApplications.length).toEqual(2);
      expect(jobApplications).toMatchObject([
        {
          offerUuid: myOffer2.uuid,
          applicantUuid: applicant.uuid
        },
        {
          offerUuid: myOffer1.uuid,
          applicantUuid: applicant.uuid
        }
      ]);
    });
  });

  describe("Delete cascade", () => {
    const createJobApplication = async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid });
      return JobApplicationRepository.apply(applicant.uuid, offer);
    };

    it("should delete all jobApplication if all offers are deleted", async () => {
      await JobApplication.truncate();
      await createJobApplication();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await OfferRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });

    it("should delete all jobApplication if all applicants are deleted", async () => {
      await JobApplication.truncate();
      await createJobApplication();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await UserRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });

    it("should delete all jobApplication if all companies are deleted", async () => {
      await JobApplication.truncate();
      await createJobApplication();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await CompanyRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });
  });
});
