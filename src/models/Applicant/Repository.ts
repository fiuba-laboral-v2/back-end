import { Applicant, IApplicant, IApplicantEditable } from "./index";
import { ApplicantNotFound } from "./Errors/ApplicantNotFound";
import Database from "../../config/Database";
import { CareerApplicantRepository } from "../CareerApplicant/Repository";
import { ApplicantCapabilityRepository } from "../ApplicantCapability/Repository";
import { SectionRepository } from "./Section/Repository";
import { ApplicantLinkRepository } from "./Link";
import { UserRepository } from "../User/Repository";
import pick from "lodash/pick";

export const ApplicantRepository = {
  create: async (
    {
      name,
      surname,
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
        { name, surname, padron, description, userUuid: userUuid },
        { transaction }
      );

      await CareerApplicantRepository.bulkCreate(applicantCareers, applicant, transaction);
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
      uuid,
      sections = [],
      links = [],
      capabilities: newCapabilities = [],
      careers = [],
      ...props
    }: IApplicantEditable
  ) => {
    const applicant = await ApplicantRepository.findByUuid(uuid);
    const transaction = await Database.transaction();
    try {
      await applicant.set(pick(props, ["name", "surname", "description"]));

      await SectionRepository.update(sections, applicant, transaction);

      await ApplicantLinkRepository.update(links, applicant, transaction);

      await CareerApplicantRepository.update(careers, applicant, transaction);

      await ApplicantCapabilityRepository.update(newCapabilities, applicant, transaction);

      await applicant.save({ transaction });

      await transaction.commit();
      return applicant;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  truncate: async () => {
    UserRepository.truncate();
  }
};
