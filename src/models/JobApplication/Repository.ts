import { Applicant, JobApplication, Offer } from "$models";
import { IUpdateApprovalStatus } from "./Interfaces";
import { JobApplicationNotFoundError } from "./Errors";
import { Secretary } from "$models/Admin";

export const JobApplicationRepository = {
  apply: (applicantUuid: string, { uuid: offerUuid }: Offer) =>
    JobApplication.create({ offerUuid, applicantUuid }),
  hasApplied: async (applicant: Applicant, offer: Offer) => {
    const jobApplication = await JobApplication.findOne({
      where: {
        offerUuid: offer.uuid,
        applicantUuid: applicant.uuid
      }
    });
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
  updateApprovalStatus: async ({
    offerUuid,
    applicantUuid,
    secretary,
    status
  }: IUpdateApprovalStatus) => {
    const attributes = {
      ...(secretary === Secretary.graduados && { graduadosApprovalStatus: status }),
      ...(secretary === Secretary.extension && { extensionApprovalStatus: status })
    };
    const [, [updatedJobApplication]] = await JobApplication.update(attributes, {
      where: { offerUuid, applicantUuid },
      returning: true
    });
    if (!updatedJobApplication) throw new JobApplicationNotFoundError(offerUuid, applicantUuid);
    return updatedJobApplication;
  },
  truncate: () => JobApplication.truncate()
};
