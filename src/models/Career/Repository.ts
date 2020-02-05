import { ICareer, CareerModel } from "./index";
import Database from "../../config/Database";
import { Op } from "sequelize";

export const CareerRepository = {
  create: async ({ code, description, credits }: ICareer) => {
    const career: CareerModel = new CareerModel({ code, description, credits });

    return CareerRepository.save(career);
  },
  save: async (career: CareerModel) => {
    const transaction = await Database.transaction();
    try {
      await career.save({ transaction: transaction });
      await transaction.commit();

      return career;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  },
  findByCode: async (code: string)  => {
    return CareerModel.findOne({ where: { code } });
  },
  findAll: async (codes: string[] = []) => {
    if (codes.length > 0) {
      return CareerModel.findAll({ where: { code: { [Op.or]: codes }}});
    } else {
      return CareerModel.findAll();
    }

  },
  truncate: async (code: string) => {
    return CareerModel.destroy({ where: { code } });
  }
};
