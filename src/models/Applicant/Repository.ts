import { Applicant, IApplicant } from "./index";
import { CareerRepository } from "../Career";
import { CapabilityRepository } from "../Capability";
import { ApplicantCapability } from "../ApplicantCapability";
import { CareerApplicant } from "../CareerApplicant";
import Database from "../../config/Database";
// import { Op } from "sequelize";

export const ApplicantRepository = {
  create: async ({
    name,
    surname,
    padron,
    description,
    credits,
    careersCodes,
    capabilities
  }: IApplicant) => {
    const careers = await CareerRepository.findByCode(careersCodes);
    const capabilityModels = await CapabilityRepository.findOrCreateMany(capabilities);
    const applicant: Applicant = new Applicant({
      name,
      surname,
      padron,
      description,
      credits
    });

    const transaction = await Database.transaction();
    try {
      await applicant.save({ transaction: transaction });

      if (careers) {
        applicant.careers = careers;
        careers.forEach(async career => (
          await CareerApplicant.create(
            { careerCode: career.code , applicantUuid: applicant.uuid },
            { transaction: transaction }
          )
        ));
      }

      if (capabilityModels) {
        applicant.capabilities = [];
        capabilityModels.forEach(async capability => {
          const newCapability = await capability;
          if (newCapability) applicant.capabilities.push(newCapability);

          await ApplicantCapability.create(
            { capabilityUuid: newCapability.uuid , applicantUuid: applicant.uuid},
            { transaction: transaction }
          );
        });
      }
      await transaction.commit();
      return applicant;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  },
  findByUuid: async (uuid: string)  => {
    return Applicant.findByPk(uuid);
  },
  findByPadron: async (padron: number)  => {
    return Applicant.findOne({ where: { padron }});
  },
  findAll: async () => {
    return Applicant.findAll({});
  },
  deleteByUuid: async (uuid: string) => {
    return Applicant.destroy({ where: { uuid } });
  },
  truncate: async () => {
    return Applicant.destroy({ truncate: true });
  }
};
