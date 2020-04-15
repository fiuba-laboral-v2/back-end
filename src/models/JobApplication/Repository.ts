import { Offer } from "../Offer";
import { Applicant } from "../Applicant";
import { JobApplication } from "./Model";

export const JobApplicationRepository = {
  create: async (applicant: Applicant, offer: Offer) =>
    JobApplication.create(
      {
        offerUuid: offer.uuid,
        applicantUuid: applicant.uuid
      }
    ),
  hasApplied: async (applicant: Applicant, offer: Offer) => {
    const jobApplication = await JobApplication.findOne(
      {
        where: {
          offerUuid: offer.uuid,
          applicantUuid: applicant.uuid
        }
      }
    );
    return jobApplication != null;
  }
};
