import { Applicant, JobApplication, Offer } from "$models";

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
  findLatestByCompanyUuid: async (companyUuid: string) =>
    JobApplication.findAll({
      include: [{
        model: Offer,
        where: { companyUuid },
        attributes: []
      }],
      order: [["updatedAt", "DESC"], ["offerUuid", "DESC"], ["applicantUuid", "DESC"]]
    }),
  truncate: () => JobApplication.truncate()
};
