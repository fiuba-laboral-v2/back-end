import { Transaction } from "sequelize";
import { Applicant, JobApplication, Offer } from "$models";
import { IFindLatestByCompanyUuid } from "./Interfaces";
import { JobApplicationNotFoundError } from "./Errors";
import { PaginationQuery } from "../PaginationQuery";
import { IPaginatedInput } from "$src/graphql/Pagination/Types/GraphQLPaginatedInput";

export const JobApplicationRepository = {
  save: (jobApplication: JobApplication, transaction?: Transaction) =>
    jobApplication.save({ transaction }),
  apply: async ({ uuid: applicantUuid }: Applicant, { uuid: offerUuid }: Offer) =>
    JobApplication.create({ offerUuid, applicantUuid }),
  findByApplicantAndOffer: async (applicant: Applicant, offer: Offer) => {
    const jobApplication = await JobApplication.findOne({
      where: { offerUuid: offer.uuid, applicantUuid: applicant.uuid }
    });
    if (!jobApplication) throw new JobApplicationNotFoundError();
    return jobApplication;
  },
  hasApplied: async (applicant: Applicant, offer: Offer) => {
    try {
      const jobApplication = await JobApplicationRepository.findByApplicantAndOffer(
        applicant,
        offer
      );
      return jobApplication.isNotRejected();
    } catch (error) {
      if (error instanceof JobApplicationNotFoundError) return false;
      throw error;
    }
  },
  findByUuid: async (uuid: string) => {
    const jobApplication = await JobApplication.findByPk(uuid);
    if (!jobApplication) throw new JobApplicationNotFoundError(uuid);
    return jobApplication;
  },
  findLatestByCompanyUuid: async ({
    companyUuid,
    updatedBeforeThan,
    approvalStatus
  }: IFindLatestByCompanyUuid) => {
    return PaginationQuery.findLatest({
      updatedBeforeThan,
      where: {
        ...(approvalStatus && { approvalStatus })
      },
      query: options => JobApplication.findAll(options),
      order: [
        ["updatedAt", "DESC"],
        ["uuid", "DESC"]
      ],
      include: [
        {
          model: Offer,
          where: { companyUuid },
          attributes: []
        }
      ]
    });
  },
  findLatest: (updatedBeforeThan?: IPaginatedInput) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => JobApplication.findAll(options)
    }),
  truncate: () => JobApplication.truncate({ cascade: true })
};
