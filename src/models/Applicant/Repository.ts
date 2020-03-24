import { Applicant, IApplicant, IApplicantEditable, IApplicantCareer } from "./index";
import { CapabilityRepository, Capability } from "../Capability";
import { ApplicantCapability } from "../ApplicantCapability";
import { CareerApplicant } from "../CareerApplicant";
import { ApplicantNotFound } from "./Errors/ApplicantNotFound";
import Database from "../../config/Database";
import pick from "lodash/pick";
import { Transaction } from "sequelize";
import { CareerApplicantRepository } from "../CareerApplicant/Repository";

export const ApplicantRepository = {
  create: async ({
    name,
    surname,
    padron,
    description,
    careers: applicantCareers = [],
    capabilities = []
  }: IApplicant) => {
    const capabilityModels: Capability[] = [];

    for (const capability of capabilities) {
      capabilityModels.push(await CapabilityRepository.findOrCreate(capability));
    }
    const applicant = new Applicant({
      name,
      surname,
      padron,
      description
    });
    return ApplicantRepository.save(applicant, applicantCareers, capabilityModels);
  },
  save: async (
    applicant: Applicant,
    applicantCareers: IApplicantCareer[] = [],
    capabilities: Capability[] = []
  ) => {
    const transaction = await Database.transaction();
    try {
      await applicant.save({ transaction });
      await ApplicantRepository.updateOrCreateCareersApplicants(
        applicant,
        applicantCareers,
        transaction
      );
      await ApplicantRepository.updateOrCreateApplicantCapabilities(
        applicant,
        capabilities,
        transaction
      );
      await transaction.commit();
      return applicant;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
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
  deleteByUuid: async (uuid: string) => {
    const transaction = await Database.transaction();
    try {
      await ApplicantCapability.destroy({ where: { applicantUuid: uuid }, transaction });
      await CareerApplicant.destroy({ where: { applicantUuid: uuid }, transaction });
      const applicantDestroyed = await Applicant.destroy({ where: { uuid }, transaction });
      await transaction.commit();
      return applicantDestroyed;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  },
  updateOrCreateApplicantCapabilities: async (
    applicant: Applicant,
    capabilities: Capability[],
    transaction?: Transaction
  ) => {
    for (const capability of capabilities) {
      if (await applicant.hasCapability(capability)) continue;
      await ApplicantCapability.create(
        { capabilityUuid: capability.uuid, applicantUuid: applicant.uuid },
        { transaction }
      );
    }
    return applicant;
  },
  updateOrCreateCareersApplicants: async (
    applicant: Applicant,
    applicantCareers: IApplicantCareer[],
    transaction?: Transaction
  ) => {
    for (const applicantCareer of applicantCareers) {
      await CareerApplicantRepository.updateOrCreate(
        applicant,
        applicantCareer,
        transaction
      );
    }
    return applicant;
  },
  update: async (applicant: Applicant, newProps: IApplicantEditable) => {
    const capabilities = await CapabilityRepository.findOrCreateByDescriptions(
      newProps.capabilities!
    );
    await applicant.set(pick(newProps, ["name", "surname", "description"]));
    return ApplicantRepository.save(
      applicant,
      newProps.careers || [],
      capabilities
    );
  },
  deleteCapabilities: async (applicant: Applicant, descriptions: string[]) => {
    const uuids = (await applicant.getCapabilities())
      .filter(c => descriptions.includes(c.description))
      .map(c => c.uuid);
    await ApplicantCapability.destroy(
      { where: { applicantUuid: applicant.uuid, capabilityUuid: uuids } }
    );
    return applicant;
  },
  deleteCareers: async (applicant: Applicant, careerCodes: string[]) => {
    const codes = (await applicant.getCareers())
      .filter(c => careerCodes.includes(c.code))
      .map(c => c.code);
    await CareerApplicant.destroy(
      { where: { applicantUuid: applicant.uuid, careerCode: codes } }
    );
    return applicant;
  },
  truncate: async () =>
    Applicant.truncate({ cascade: true })
};
