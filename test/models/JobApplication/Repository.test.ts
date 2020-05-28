import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import Database from "../../../src/config/Database";
import { CompanyRepository } from "../../../src/models/Company";
import { Offer, OfferRepository } from "../../../src/models/Offer";
import { JobApplication, JobApplicationRepository } from "../../../src/models/JobApplication";
import { UserRepository } from "../../../src/models/User";
import { CompanyGenerator, TCompanyGenerator } from "../../generators/Company";
import { ApplicantGenerator, TApplicantGenerator } from "../../generators/Applicant";
import { OfferMocks } from "../Offer/mocks";

describe("JobApplicationRepository", () => {
  let generateCompany: TCompanyGenerator;
  let generateApplicant: TApplicantGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    generateCompany = CompanyGenerator.withMinimumData();
    generateApplicant = ApplicantGenerator.withMinimumData();
  });

  afterAll(() => Database.close());

  describe("Apply", () => {
    it("should apply to a new jobApplication", async () => {
      const applicant = await generateApplicant.next().value;
      const company = await generateCompany.next().value;
      const offer = await Offer.create(OfferMocks.completeData(company.uuid));
      const jobApplication = await JobApplicationRepository.apply(applicant.uuid, offer);
      expect(jobApplication).toMatchObject(
        {
          offerUuid: offer.uuid,
          applicantUuid: applicant.uuid
        }
      );
    });

    it("should create four valid jobApplications for for the same offer", async () => {
      const applicant1 = await generateApplicant.next().value;
      const applicant2 = await generateApplicant.next().value;
      const applicant3 = await generateApplicant.next().value;
      const applicant4 = await generateApplicant.next().value;
      const company = await generateCompany.next().value;
      const offer = await Offer.create(OfferMocks.completeData(company.uuid));
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
      const company = await generateCompany.next().value;
      const offer = await Offer.create(OfferMocks.completeData(company.uuid));
      const notExistingApplicantUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      await expect(
        JobApplicationRepository.apply(notExistingApplicantUuid, offer)
      ).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        "insert or update on table \"JobApplications\" violates foreign key " +
        "constraint \"JobApplications_applicantUuid_fkey\""
      );
    });

    it("should throw an error if given offerUuid that does not exist", async () => {
      const { uuid: applicantUuid } = await generateApplicant.next().value;
      const jobApplication = new JobApplication({
        offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        applicantUuid
      });
      await expect(
        jobApplication.save()
      ).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        "insert or update on table \"JobApplications\" violates foreign key " +
        "constraint \"JobApplications_offerUuid_fkey\""
      );
    });

    it("should throw an error if jobApplication already exists", async () => {
      const applicant = await generateApplicant.next().value;
      const company = await generateCompany.next().value;
      const offer = await Offer.create(OfferMocks.completeData(company.uuid));
      await JobApplicationRepository.apply(applicant.uuid, offer);
      await expect(
        JobApplicationRepository.apply(applicant.uuid, offer)
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });
  });

  describe("Associations", () => {
    it("should get Applicant and offer from a jobApplication", async () => {
      const applicant = await generateApplicant.next().value;
      const company = await generateCompany.next().value;
      const offerData = OfferMocks.completeData(company.uuid);
      const offer = await OfferRepository.create(offerData);
      const jobApplication = await JobApplicationRepository.apply(applicant.uuid, offer);
      expect((await jobApplication.getApplicant()).toJSON()).toMatchObject(applicant.toJSON());
      expect(await jobApplication.getOffer()).toMatchObject(offerData);
    });

    it("should get all applicant's jobApplications", async () => {
      const applicant = await generateApplicant.next().value;
      const company = await generateCompany.next().value;
      const offer = await OfferRepository.create(OfferMocks.completeData(company.uuid));
      const jobApplication = await JobApplicationRepository.apply(applicant.uuid, offer);
      expect(
        (await applicant.getJobApplications()).map(aJobApplication => aJobApplication.toJSON())
      ).toEqual(
        expect.arrayContaining([jobApplication.toJSON()])
      );
    });
  });

  describe("hasApplied", () => {
    it("should return true if applicant applied for offer", async () => {
      const applicant = await generateApplicant.next().value;
      const company = await generateCompany.next().value;
      const offer = await Offer.create(OfferMocks.completeData(company.uuid));
      await JobApplicationRepository.apply(applicant.uuid, offer);
      expect(await JobApplicationRepository.hasApplied(applicant, offer)).toBe(true);
    });

    it("should return false if applicant has not applied to the offer", async () => {
      const applicant = await generateApplicant.next().value;
      const company = await generateCompany.next().value;
      const offer = await Offer.create(OfferMocks.completeData(company.uuid));
      expect(await JobApplicationRepository.hasApplied(applicant, offer)).toBe(false);
    });
  });

  describe("findLatestByCompanyUuid", () => {
    it ("returns the only application for my company", async () => {
      const applicant = await generateApplicant.next().value;
      const company = await generateCompany.next().value;
      const offer = await Offer.create(OfferMocks.completeData(company.uuid));
      await JobApplicationRepository.apply(applicant.uuid, offer);
      const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid(
        company.uuid
      );
      expect(jobApplications.length).toEqual(1);
      expect(jobApplications).toMatchObject([
        {
          offerUuid: offer.uuid,
          applicantUuid: applicant.uuid
        }
      ]);
    });

    it ("returns no job applications if my company has any", async () => {
      const company = await generateCompany.next().value;
      const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid(
        company.uuid
      );
      expect(jobApplications.length).toEqual(0);
    });

    it ("returns the latest job applications first for my company", async () => {
      const applicant = await generateApplicant.next().value;
      const myCompany = await generateCompany.next().value;
      const anotherCompany = await generateCompany.next().value;
      const myOffer1 = await Offer.create(OfferMocks.completeData(myCompany.uuid));
      const myOffer2 = await Offer.create(OfferMocks.completeData(myCompany.uuid));
      const notMyOffer = await Offer.create(OfferMocks.completeData(anotherCompany.uuid));

      await JobApplicationRepository.apply(applicant.uuid, myOffer1);
      await JobApplicationRepository.apply(applicant.uuid, myOffer2);
      await JobApplicationRepository.apply(applicant.uuid, notMyOffer);
      const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid(
        myCompany.uuid
      );
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
      const applicant = await generateApplicant.next().value;
      const company = await generateCompany.next().value;
      const offer = await Offer.create(OfferMocks.completeData(company.uuid));
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
