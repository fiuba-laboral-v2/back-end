import { Applicant, IApplicant, IApplicantEditable } from "./index";
import { ApplicantNotFound, ApplicantNotUpdatedError } from "./Errors";
import Database from "../../config/Database";
import { ApplicantCareersRepository } from "../ApplicantCareer/Repository";
import { ApplicantCapabilityRepository } from "../ApplicantCapability/Repository";
import { ApplicantApprovalEventRepository } from "./ApplicantApprovalEvent";
import { SectionRepository } from "./Section/Repository";
import { ApplicantLinkRepository } from "./Link";
import { UserRepository } from "../User/Repository";
import { ApprovalStatus } from "../ApprovalStatus";

export const ApplicantRepository = {
  create: async (
    {
      padron,
      description,
      careers: applicantCareers = [],
      capabilities = [],
      user
    }: IApplicant
  ) => {
    const transaction = await Database.transaction();
    try {
      const { uuid: userUuid } = await UserRepository.create(user, transaction);
      const applicant = await Applicant.create(
        { padron, description, userUuid: userUuid },
        { transaction }
      );

      await ApplicantCareersRepository.bulkCreate(applicantCareers, applicant, transaction);
      await ApplicantCapabilityRepository.update(capabilities, applicant, transaction);

      await transaction.commit();
      return applicant;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  findAll: async () => Applicant.findAll(),
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
  update: async (
    {
      user: userAttributes = {},
      description,
      uuid,
      sections = [],
      links = [],
      capabilities: newCapabilities = [],
      careers = []
    }: IApplicantEditable
  ) => {
    const applicant = await ApplicantRepository.findByUuid(uuid);
    const user = await applicant.getUser();
    const transaction = await Database.transaction();
    try {
      await applicant.set({ description });

      await UserRepository.update(user, userAttributes, transaction);

      await SectionRepository.update(sections, applicant, transaction);

      await ApplicantLinkRepository.update(links, applicant, transaction);

      await ApplicantCareersRepository.update(careers, applicant, transaction);

      await ApplicantCapabilityRepository.update(newCapabilities, applicant, transaction);

      await applicant.save({ transaction });

      await transaction.commit();
      return applicant;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  updateApprovalStatus: async (
    adminUserUuid: string,
    applicantUuid: string,
    status: ApprovalStatus
  ) => {
    const transaction = await Database.transaction();
    try {
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
      await transaction.commit();
      return updatedApplicant;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  truncate: () => Applicant.truncate({ cascade: true })
};
