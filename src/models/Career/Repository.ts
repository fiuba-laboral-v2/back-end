import { ICareer, Career } from "./index";
import { Op } from "sequelize";
import { ApplicantCareer } from "../ApplicantCareer/Model";
import Database from "../../config/Database";

import { CareersNotFound } from "./Errors/CareersNotFound";

import difference from "lodash/difference";
import map from "lodash/map";

export const CareerRepository = {
  create: async ({ code, description, credits }: ICareer) => {
    const career = new Career({ code, description, credits });
    return career.save();
  },
  findByCodes: async (codes: string[]) => {
    const careers = await Career.findAll({ where: { code: { [Op.or]: codes } } });
    if (careers.length < codes.length) {
      throw new CareersNotFound(difference(codes, map(careers, ({ code }) => code)));
    }
    return careers;
  },
  findByCode: async (codes: string) => {
    const [career] = await CareerRepository.findByCodes([codes]);
    return career;
  },
  findAll: async () =>
    Career.findAll(),
  deleteByCode: async (code: string) => {
    const transaction = await Database.transaction();
    try {
      await ApplicantCareer.destroy({ where: { careerCode: code }, transaction });
      const careerErased = await Career.destroy({ where: { code }, transaction });
      await transaction.commit();
      return careerErased;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  truncate: async () =>
    Career.truncate({ cascade: true })
};
