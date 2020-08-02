import { Applicant, JobApplication, Offer } from "..";

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
    return JobApplication.findAll({
      where: {
        offerUuid: offers.map(({ uuid }) => uuid)
      },
      order: [["createdAt", "DESC"]]
    });
  },
  truncate: () => JobApplication.truncate()
};
