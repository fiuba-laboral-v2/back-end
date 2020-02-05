import { ApplicantProfile, IApplicantProfile } from "./index";
import { CareerModel, CareerRepository } from "../Career";
import { CapabilityModel } from "../Capability";
import Database from "../../config/Database";
import { Op } from "sequelize";

export const ApplicantProfileRepository = {
  create: async ({
    name,
    surname,
    padron,
    description,
    credits,
    careers_codes,
    capabilities
  }: IApplicantProfile) => {
    const careers: CareerModel[] | null = await CareerRepository.findAll(careers_codes);
    const capabilityModels: CapabilityModel[] | null = await CapabilityModel.findAll({
       where: { code: { [Op.or]: capabilities }}
      });
    const applicantProfile: ApplicantProfile = new ApplicantProfile({
      name,
      surname,
      padron,
      description,
      credits
    });

    return ApplicantProfileRepository.save(applicantProfile, careers, capabilityModels);
  },
  save: async (
    applicantProfile: ApplicantProfile,
    careers: CareerModel[],
    capabilityModels: CapabilityModel[]
  ) => {
    const transaction = await Database.transaction();
    try {
      await applicantProfile.save({ transaction: transaction });

      applicantProfile.careers = careers;
      if (capabilityModels) applicantProfile.capabilities = capabilityModels;

      await transaction.commit();
      return applicantProfile;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  },
  findByUuid: async (uuid: string)  => {
    return ApplicantProfile.findByPk(uuid);
  },
  findByPadron: async (padron: number)  => {
    return ApplicantProfile.findOne({ where: { padron }});
  },
  findAll: async () => {
    return ApplicantProfile.findAll({});
  },
  truncate: async (uuid: string) => {
    return ApplicantProfile.destroy({ where: { uuid } });
  }
};
