import { IApplicantEditable, ISaveApplicant } from "./index";
import { ApplicantNotFound, ApplicantNotUpdatedError } from "./Errors";
import { Database } from "$config";
import { IPaginatedInput } from "$src/graphql/Pagination/Types/GraphQLPaginatedInput";
import { ApplicantCareersRepository } from "./ApplicantCareer";
import { ApplicantCapabilityRepository } from "../ApplicantCapability";
import { ApplicantApprovalEventRepository } from "./ApplicantApprovalEvent";
import { SectionRepository } from "./Section";
import { ApplicantLinkRepository } from "./Link";
import { UserRepository } from "../User";
import { ApprovalStatus } from "../ApprovalStatus";
import { Applicant } from "..";
import { Op } from "sequelize";
import { PaginationConfig } from "$config/PaginationConfig";

export const ApplicantRepository = {
  create: ({
    padron,
    description,
    careers: applicantCareers = [],
    capabilities = [],
    user
  }: ISaveApplicant) =>
    Database.transaction(async transaction => {
      const { uuid: userUuid } = await UserRepository.createFiubaUser(user, transaction);
      const applicant = await Applicant.create(
        { padron, description, userUuid: userUuid },
        { transaction }
      );
      await ApplicantCareersRepository.bulkCreate(applicantCareers, applicant, transaction);
      await ApplicantCapabilityRepository.update(capabilities, applicant, transaction);
      return applicant;
    }),
  findLatest: async (updatedBeforeThan?: IPaginatedInput) => {
    const limit = PaginationConfig.itemsPerPage() + 1;
    const result = await Applicant.findAll({
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
              uuid: {
                [Op.lt]: updatedBeforeThan.uuid
              }
            }
          ]
        }
      }),
      order: [
        ["updatedAt", "DESC"],
        ["uuid", "DESC"]
      ],
      limit
    });
    return {
      shouldFetchMore: result.length === limit,
      results: result.slice(0, limit - 1)
    };
  },
  findByUuid: async (uuid: string) => {
    const applicant = await Applicant.findByPk(uuid);
    if (!applicant) throw new ApplicantNotFound(uuid);

    return applicant;
  },
  findByPadron: async (padron: number) => {
    const applicant = await Applicant.findOne({ where: { padron } });
    if (!applicant) throw new ApplicantNotFound(padron);

    return applicant;
  },
  update: ({
    user: userAttributes = {},
    description,
    uuid,
    sections = [],
    links = [],
    capabilities: newCapabilities = [],
    careers = []
  }: IApplicantEditable) =>
    Database.transaction(async transaction => {
      const applicant = await ApplicantRepository.findByUuid(uuid);
      const user = await applicant.getUser();
      await applicant.set({ description });
      await UserRepository.update(user, userAttributes, transaction);
      await SectionRepository.update(sections, applicant, transaction);
      await ApplicantLinkRepository.update(links, applicant, transaction);
      await ApplicantCareersRepository.update(careers, applicant, transaction);
      await ApplicantCapabilityRepository.update(newCapabilities, applicant, transaction);
      await applicant.save({ transaction });
      return applicant;
    }),
  updateApprovalStatus: (adminUserUuid: string, applicantUuid: string, status: ApprovalStatus) =>
    Database.transaction(async transaction => {
      const [numberOfUpdatedApplicants, [updatedApplicant]] = await Applicant.update(
        { approvalStatus: status },
        { where: { uuid: applicantUuid }, returning: true, transaction }
      );
      if (numberOfUpdatedApplicants !== 1) throw new ApplicantNotUpdatedError(applicantUuid);
      await ApplicantApprovalEventRepository.create({
        adminUserUuid,
        applicantUuid,
        status,
        transaction
      });
      return updatedApplicant;
    }),
  truncate: () => Applicant.truncate({ cascade: true })
};
