import { Applicant, JobApplication, Offer } from "$models";
import { IUpdateApprovalStatus } from "./Interfaces";
import { JobApplicationApprovalEventRepository } from "./JobApplicationsApprovalEvent";
import { JobApplicationNotFoundError } from "./Errors";
import { Secretary } from "$models/Admin";
import { IPaginatedJobApplicationsInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { Op } from "sequelize";
import { PaginationConfig } from "$config/PaginationConfig";

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
  findLatestByCompanyUuid: async ({
    companyUuid,
    updatedBeforeThan
  }: {
    companyUuid: string;
    updatedBeforeThan?: IPaginatedJobApplicationsInput;
  }) => {
    const limit = PaginationConfig.itemsPerPage() + 1;
    const result = await JobApplication.findAll({
      include: [
        {
          model: Offer,
          where: { companyUuid },
          attributes: []
        }
      ],
      ...(updatedBeforeThan && {
        where: {
          [Op.or]: [
            {
              updatedAt: {
                [Op.lt]: updatedBeforeThan.dateTime.toISOString()
              }
            },
            {
              updatedAt: updatedBeforeThan.dateTime.toISOString(),
              offerUuid: {
                [Op.lt]: updatedBeforeThan.offerUuid
              }
            },
            {
              updatedAt: updatedBeforeThan.dateTime.toISOString(),
              offerUuid: updatedBeforeThan.offerUuid,
              applicantUuid: {
                [Op.lt]: updatedBeforeThan.applicantUuid
              }
            }
          ]
        }
      }),
      order: [
        ["updatedAt", "DESC"],
        ["offerUuid", "DESC"],
        ["applicantUuid", "DESC"]
      ],
      limit
    });
    return {
      shouldFetchMore: result.length === limit,
      results: result.slice(0, limit - 1)
    };
  },
  updateApprovalStatus: async ({
    adminUserUuid,
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

    await JobApplicationApprovalEventRepository.create({
      adminUserUuid,
      jobApplicationUuid: updatedJobApplication.uuid,
      status
    });
    return updatedJobApplication;
  },
  truncate: () => JobApplication.truncate({ cascade: true })
};
