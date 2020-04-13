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
    )
};
