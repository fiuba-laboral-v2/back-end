import Database from "../../../src/config/Database";
import { ApplicantRepository } from "../../../src/models/Applicant";
import { Company, CompanyRepository } from "../../../src/models/Company";
import { Offer } from "../../../src/models/Offer";
import { JobApplicationRepository } from "../../../src/models/JobApplication";
import { UserRepository } from "../../../src/models/User";
import { companyMocks } from "../Company/mocks";
import { applicantMocks } from "../Applicant/mocks";
import { OfferMocks } from "../Offer/mocks";

describe("JobApplicationRepository", () => {
  let company: Company;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    company = await Company.create(companyMocks.companyData());
  });

  beforeEach(async () => {
    await ApplicantRepository.truncate();
  });

  afterAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
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

    describe("findByCompany", () => {
      it ("returns the only application for my company", async () => {
        const offer = await Offer.create(OfferMocks.completeData(company.uuid));
        const applicant = await ApplicantRepository.create(applicantMocks.applicantData([]));
        await JobApplicationRepository.apply(applicant.uuid, offer);
        const jobApplications = await JobApplicationRepository.findByCompany(company);
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
        const jobApplications = await JobApplicationRepository.findByCompany(company);
        expect(jobApplications.length).toEqual(0);
      });

      it ("returns only the job applications for my company", async () => {
        const anotherCompany = await CompanyRepository.create(
          {
            user: {
              email: "email@email.com",
              password: "verySecurePassword101",
              name: "name",
              surname: "surname"
            },
            cuit: "30701307115",
            companyName: "companyName"
          }
        );
        const myOffer1 = await Offer.create(OfferMocks.completeData(company.uuid));
        const myOffer2 = await Offer.create(OfferMocks.completeData(company.uuid));
        const notMyOffer = await Offer.create(OfferMocks.completeData(anotherCompany.uuid));
        const applicant = await ApplicantRepository.create(applicantMocks.applicantData([]));

        await JobApplicationRepository.apply(applicant.uuid, myOffer1);
        await JobApplicationRepository.apply(applicant.uuid, myOffer2);
        await JobApplicationRepository.apply(applicant.uuid, notMyOffer);
        const jobApplications = await JobApplicationRepository.findByCompany(company);
        expect(jobApplications.length).toEqual(2);
        expect(jobApplications).toMatchObject([
          {
            offerUuid: myOffer1.uuid,
            applicantUuid: applicant.uuid
          },
          {
            offerUuid: myOffer2.uuid,
            applicantUuid: applicant.uuid
          }
        ]);
      });
    });
  });
});
