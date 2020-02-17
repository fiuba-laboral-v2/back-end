import { Applicant, IApplicant } from "./index";
import { CareerRepository, Career } from "../Career";
import { CapabilityRepository, Capability } from "../Capability";
import { ApplicantCapability } from "../ApplicantCapability";
import { CareerApplicant } from "../CareerApplicant";
import Database from "../../config/Database";

export const ApplicantRepository = {
  create: async ({
    name,
    surname,
    padron,
    description,
    credits,
    careersCodes = [],
    capabilities = []
  }: IApplicant) => {
    const careers = careersCodes.length > 0 ? await CareerRepository.findByCode(careersCodes): [];
    const capabilityModels: Capability[] = [];

    for (const capability of capabilities) {
      const result = await CapabilityRepository.findOrCreate(capability);
      capabilityModels.push(result[0]);
    }

    const applicant: Applicant = new Applicant({
      name,
      surname,
      padron,
      description,
      credits
    });

    const transaction = await Database.transaction();
    try {
      await applicant.save({ transaction });

      applicant.careers = careers;
      careers.forEach(async career => (
        await CareerApplicant.create(
          { careerCode: career.code , applicantUuid: applicant.uuid },
          { transaction }
        )
      ));

      applicant.capabilities = capabilityModels;
      for (const capability of capabilityModels) {
          await ApplicantCapability.create(
            { capabilityUuid: capability.uuid , applicantUuid: applicant.uuid},
            { transaction }
          );
      }

      await transaction.commit();
      return applicant;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  },
  findByUuid: async (uuid: string)  =>
    Applicant.findByPk(uuid, { include: [Career, Capability] }),
  findByPadron: async (padron: number)  =>
    Applicant.findOne({ where: { padron }, include: [Career, Capability]}),
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
  truncate: async () =>
    Applicant.truncate({ cascade: true })
};
