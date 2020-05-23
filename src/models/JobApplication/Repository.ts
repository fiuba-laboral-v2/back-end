import { Offer } from "../Offer";
import { Applicant } from "../Applicant";
import { JobApplication } from "./Model";
import { Company } from "../Company";

export const JobApplicationRepository = {
  apply: async (applicantUuid: string, offer: Offer) =>
    JobApplication.create(
      {
        offerUuid: offer.uuid,
        applicantUuid
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
  },
  findByCompany: async (company: Company) => {
    const offers = await company.getOffers();
    return JobApplication.findAll({
      where: {
        offerUuid: offers.map(({ uuid }) => uuid)
      }
    });
  },
  truncate: () => JobApplication.truncate()
};
