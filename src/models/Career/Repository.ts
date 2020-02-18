import { ICareer, Career } from "./index";
import { Op } from "sequelize";
import { CareerApplicant } from "../CareerApplicant/Model";
import Database from "../../config/Database";

import { CareersNotFound } from "./Errors/CareersNotFound";

import difference from "lodash/difference";
import map from "lodash/map";

export const CareerRepository = {
  create: async ({ code, description, credits }: ICareer) => {
    const career: Career = new Career({ code, description, credits });
    return career.save();
  },
  findByCode: async (codes: string[])  => {
    const careers = await Career.findAll({ where: { code: { [Op.or]: codes }} });
    if (careers.length < codes.length) {
      throw new CareersNotFound(difference(codes, map(careers, ({code}) => code)));
    }
    return careers;
  },
  findAll: async () =>
    Career.findAll(),
  deleteByCode: async (code: string) => {
    const transaction = await Database.transaction();
    try {
      await CareerApplicant.destroy({ where: { careerCode: code }, transaction});
      const carrerDestroyed = await Career.destroy({ where: { code }, transaction });
      await transaction.commit();
      return carrerDestroyed;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  },
  truncate: async () =>
    Career.destroy({ truncate: true })
};
