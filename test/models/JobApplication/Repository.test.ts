import Database from "../../../src/config/Database";
import { ApplicantRepository } from "../../../src/models/Applicant";
import { Company, CompanyRepository } from "../../../src/models/Company";
import { Offer, OfferRepository } from "../../../src/models/Offer";
import { JobApplicationRepository } from "../../../src/models/JobApplication";
import { companyMocks } from "../Company/mocks";
import { applicantMocks } from "../Applicant/mocks";
import { OfferMocks } from "../Offer/mocks";
import { UserRepository } from "../../../src/models/User/Repository";

describe("JobApplicationRepository", () => {
  let company: Company;

  beforeAll(async () => {
    await Database.setConnection();
    company = await Company.create(companyMocks.companyData());
  });

  beforeEach(async () => {
    await OfferRepository.truncate();
    await UserRepository.truncate();
  });

  afterAll(async () => {
    await CompanyRepository.truncate();
    await Database.close();
  });

  describe("Apply", () => {
    it("should apply to a new jobApplication", async () => {
      const offer = await Offer.create(OfferMocks.completeData(company.uuid));
      const applicant = await ApplicantRepository.create(applicantMocks.applicantData([]));
      const jobApplication = await JobApplicationRepository.apply(applicant.uuid, offer);
      expect(jobApplication).toMatchObject(
        {
          offerUuid: offer.uuid,
          applicantUuid: applicant.uuid
        }
      );
    });

    describe("hasApplied", () => {
      it("should return true if applicant applied for offer", async () => {
        const offer = await Offer.create(OfferMocks.completeData(company.uuid));
        const applicant = await ApplicantRepository.create(applicantMocks.applicantData([]));
        await JobApplicationRepository.apply(applicant.uuid, offer);
        expect(await JobApplicationRepository.hasApplied(applicant, offer)).toBe(true);
      });

      it("should return false if applicant has not applied to the offer", async () => {
        const offer = await Offer.create(OfferMocks.completeData(company.uuid));
        const applicant = await ApplicantRepository.create(applicantMocks.applicantData([]));
        expect(await JobApplicationRepository.hasApplied(applicant, offer)).toBe(false);
      });
    });

    describe("findByCompanyUuid", () => {
      it ("returns the only application for my company", async () => {
        const offer = await Offer.create(OfferMocks.completeData(company.uuid));
        const applicant = await ApplicantRepository.create(applicantMocks.applicantData([]));
        await JobApplicationRepository.apply(applicant.uuid, offer);
        const jobApplications = await JobApplicationRepository.findByCompanyUuid(company.uuid);
        expect(jobApplications.length).toEqual(1);
        expect(jobApplications).toMatchObject([
          {
            offerUuid: offer.uuid,
            applicantUuid: applicant.uuid
          }
        ]);
      });

      it ("returns no job applications if my company has any", async () => {
        await Offer.create(OfferMocks.completeData(company.uuid));
        await ApplicantRepository.create(applicantMocks.applicantData([]));
        const jobApplications = await JobApplicationRepository.findByCompanyUuid(company.uuid);
        expect(jobApplications.length).toEqual(0);
      });
    });
  });
});
