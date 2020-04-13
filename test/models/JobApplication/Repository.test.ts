import Database from "../../../src/config/Database";
import { Applicant } from "../../../src/models/Applicant";
import { Company } from "../../../src/models/Company";
import { Offer } from "../../../src/models/Offer";
import { JobApplicationRepository } from "../../../src/models/JobApplication";
import { companyMockData } from "../Company/mocks";
import { applicantMocks } from "../Applicant/mocks";
import { OfferMocks } from "../Offer/mocks";

describe("JobApplicationRepository", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(async () => {
    await Applicant.truncate({ cascade: true });
    await Company.truncate({ cascade: true });
    await Offer.truncate({ cascade: true });
  });

  afterAll(() => Database.close());

  describe("Create", () => {
    it("should apply to a new jobApplication", async () => {
      const { id: companyId } = await Company.create(companyMockData);
      const offer = await Offer.create(OfferMocks.completeData(companyId));
      const applicant = await Applicant.create(applicantMocks.applicantData([]));
      const jobApplication = await JobApplicationRepository.create(applicant, offer);
      expect(jobApplication).toMatchObject(
        {
          offerUuid: offer.uuid,
          applicantUuid: applicant.uuid
        }
      );
    });
  });
});
