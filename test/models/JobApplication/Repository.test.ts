import Database from "../../../src/config/Database";
import { ApplicantRepository } from "../../../src/models/Applicant";
import { Company } from "../../../src/models/Company";
import { Offer } from "../../../src/models/Offer";
import { JobApplicationRepository } from "../../../src/models/JobApplication";
import { companyMockData } from "../Company/mocks";
import { applicantMocks } from "../Applicant/mocks";
import { OfferMocks } from "../Offer/mocks";
import { UserRepository } from "../../../src/models/User/Repository";

describe("JobApplicationRepository", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(async () => {
    await UserRepository.truncate();
    await Company.truncate({ cascade: true });
    await Offer.truncate({ cascade: true });
  });

  afterAll(() => Database.close());

  describe("Apply", () => {
    it("should apply to a new jobApplication", async () => {
      const { uuid: companyUuid } = await Company.create(companyMockData);
      const offer = await Offer.create(OfferMocks.completeData(companyUuid));
      const applicant = await ApplicantRepository.create(applicantMocks.applicantData([]));
      const jobApplication = await JobApplicationRepository.apply(applicant, offer);
      expect(jobApplication).toMatchObject(
        {
          offerUuid: offer.uuid,
          applicantUuid: applicant.uuid
        }
      );
    });

    describe("hasApplied", () => {
      const createOffer = async () => {
        const { uuid: companyUuid } = await Company.create(companyMockData);
        return Offer.create(OfferMocks.completeData(companyUuid));
      };

      it("should return true if applicant applied for offer", async () => {
        const offer = await createOffer();
        const applicant = await ApplicantRepository.create(applicantMocks.applicantData([]));
        await JobApplicationRepository.apply(applicant, offer);
        expect(await JobApplicationRepository.hasApplied(applicant, offer)).toBe(true);
      });

      it("should return false if applicant has not applied to the offer", async () => {
        const offer = await createOffer();
        const applicant = await ApplicantRepository.create(applicantMocks.applicantData([]));
        expect(await JobApplicationRepository.hasApplied(applicant, offer)).toBe(false);
      });
    });
  });
});
