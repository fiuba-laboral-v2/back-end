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
  hasApplied: async (applicant: Applicant, offer: Offer) => {
    const jobApplication = await JobApplication.findOne({
      where: {
        offerUuid: offer.uuid,
        applicantUuid: applicant.uuid
      }
    });
    return jobApplication != null;
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
        ["offerUuid", "DESC"],
        ["applicantUuid", "DESC"]
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
  findCompanyUsers: async (jobApplication: JobApplication) => {
    const offer = await jobApplication.getOffer();
    const company = await offer.getCompany();
    return company.getUsers();
  },
  truncate: () => JobApplication.truncate({ cascade: true })
};
