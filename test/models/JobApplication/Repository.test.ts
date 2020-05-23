import Database from "../../../src/config/Database";
import { Applicant } from "../../../src/models/Applicant";
import { Company, CompanyRepository } from "../../../src/models/Company";
import { Offer } from "../../../src/models/Offer";
import { JobApplicationRepository } from "../../../src/models/JobApplication";
import { UserRepository } from "../../../src/models/User";
import { companyMocks } from "../Company/mocks";
import { applicantMocks } from "../Applicant/mocks";
import { OfferMocks } from "../Offer/mocks";

describe("JobApplicationRepository", () => {
  let company1: Company;
  let company2: Company;
  let company3: Company;
  let company4: Company;
  let company5: Company;
  let company6: Company;
  let company7: Company;
  let applicant1: Applicant;
  let applicant2: Applicant;
  let applicant3: Applicant;
  let applicant4: Applicant;
  let applicant5: Applicant;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    [
      company1,
      company2,
      company3,
      company4,
      company5,
      company6,
      company7
    ] = await companyMocks.createSevenCompaniesWithMinimumData();
    [
      applicant1,
      applicant2,
      applicant3,
      applicant4,
      applicant5
    ] = await applicantMocks.createFiveApplicantsWithMinimumData();
  });

  afterAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await Database.close();
  });

  describe("Apply", () => {
    it("should apply to a new jobApplication", async () => {
      const offer = await Offer.create(OfferMocks.completeData(company1.uuid));
      const jobApplication = await JobApplicationRepository.apply(applicant1.uuid, offer);
      expect(jobApplication).toMatchObject(
        {
          offerUuid: offer.uuid,
          applicantUuid: applicant1.uuid
        }
      );
    });

    describe("hasApplied", () => {
      it("should return true if applicant applied for offer", async () => {
        const offer = await Offer.create(OfferMocks.completeData(company2.uuid));
        await JobApplicationRepository.apply(applicant2.uuid, offer);
        expect(await JobApplicationRepository.hasApplied(applicant2, offer)).toBe(true);
      });

      it("should return false if applicant has not applied to the offer", async () => {
        const offer = await Offer.create(OfferMocks.completeData(company3.uuid));
        expect(await JobApplicationRepository.hasApplied(applicant3, offer)).toBe(false);
      });
    });

    describe("findByCompany", () => {
      it ("returns the only application for my company", async () => {
        const offer = await Offer.create(OfferMocks.completeData(company4.uuid));
        await JobApplicationRepository.apply(applicant4.uuid, offer);
        const jobApplications = await JobApplicationRepository.findByCompanyUuid(company4.uuid);
        expect(jobApplications.length).toEqual(1);
        expect(jobApplications).toMatchObject([
          {
            offerUuid: offer.uuid,
            applicantUuid: applicant4.uuid
          }
        ]);
      });

      it ("returns no job applications if my company has any", async () => {
        const jobApplications = await JobApplicationRepository.findByCompanyUuid(company5.uuid);
        expect(jobApplications.length).toEqual(0);
      });

      it ("returns only the job applications for my company", async () => {
        const myOffer1 = await Offer.create(OfferMocks.completeData(company6.uuid));
        const myOffer2 = await Offer.create(OfferMocks.completeData(company6.uuid));
        const notMyOffer = await Offer.create(OfferMocks.completeData(company7.uuid));

        await JobApplicationRepository.apply(applicant5.uuid, myOffer1);
        await JobApplicationRepository.apply(applicant5.uuid, myOffer2);
        await JobApplicationRepository.apply(applicant5.uuid, notMyOffer);
        const jobApplications = await JobApplicationRepository.findByCompanyUuid(company6.uuid);
        expect(jobApplications.length).toEqual(2);
        expect(jobApplications).toMatchObject([
          {
            offerUuid: myOffer1.uuid,
            applicantUuid: applicant5.uuid
          },
          {
            offerUuid: myOffer2.uuid,
            applicantUuid: applicant5.uuid
          }
        ]);
      });
    });
  });
});
