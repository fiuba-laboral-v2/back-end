import { Offer } from "../Offer/Model";
import { Applicant } from "../Applicant";
import { JobApplication } from "./Model";
import { sortBy } from "lodash";

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
  findLatestByCompanyUuid: async (companyUuid: string) => {
    const offers = await Offer.findAll({ where: { companyUuid } });
    const jobApplications = await JobApplication.findAll({
      where: {
        offerUuid: offers.map(({ uuid }) => uuid)
      }
    });
    return sortBy(jobApplications, ["createdAt"]).reverse();
  },
  truncate: () => JobApplication.truncate()
};
