import { Applicant, IApplicant, IApplicantEditable, IApplicantCareer } from "./index";
import { CareerRepository, Career } from "../Career";
import { CapabilityRepository, Capability } from "../Capability";
import { ApplicantCapability } from "../ApplicantCapability";
import { CareerApplicant } from "../CareerApplicant";
import { ApplicantNotFound } from "./Errors/ApplicantNotFound";
import Database from "../../config/Database";
import map from "lodash/map";
import pick from "lodash/pick";

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
      const result = await CapabilityRepository.findOrCreate(capability);
      capabilityModels.push(result[0]);
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
    const careers = applicantCareers.length > 0 ?
      await CareerRepository.findByCodes(map(applicantCareers, career => career.code)): [];
    const transaction = await Database.transaction();
    try {
      await applicant.save({ transaction });
      await applicant.addCareers(careers, applicantCareers, transaction);
      await applicant.addCapabilities(capabilities, transaction);
      await transaction.commit();
      return applicant;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  },
  findByUuid: async (uuid: string)  =>
    Applicant.findByPk(uuid, { include: [Career, Capability] }),
  findByPadron: async (padron: number) => {
    const applicant =  await Applicant.findOne({ where: { padron }, include: [Career, Capability]});
    if (!applicant) throw new ApplicantNotFound(padron);

    return applicant;
  },
  deleteByUuid: async (uuid: string) => {
    const transaction = await Database.transaction();
    try {
      await ApplicantCapability.destroy({ where: { applicantUuid: uuid }, transaction });
      await CareerApplicant.destroy({ where: { applicantUuid: uuid }, transaction});
      const applicantDestroyed =  await Applicant.destroy({ where: { uuid }, transaction });
      await transaction.commit();
      return applicantDestroyed;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  },
  update: async (applicant: Applicant, newProps: IApplicantEditable) => {
    await applicant.set(pick(newProps, ["name", "surname", "description"]));
    const capabilities = await CapabilityRepository.findOrCreateByDescriptions(
      newProps.capabilities!
    );
    return ApplicantRepository.save(applicant, newProps.careers, capabilities);
  },
  truncate: async () =>
    Applicant.truncate({ cascade: true })
};
