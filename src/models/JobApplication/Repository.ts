import { Applicant, JobApplication, Offer } from "$models";
import { IPaginatedJobApplicationsInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { Op } from "sequelize";
import { PaginationConfig } from "$config/PaginationConfig";

export const JobApplicationRepository = {
  apply: async (applicantUuid: string, offer: Offer) =>
    JobApplication.create({
      offerUuid: offer.uuid,
      applicantUuid
    }),
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
  truncate: () => JobApplication.truncate()
};
