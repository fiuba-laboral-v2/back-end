import { ICareer, Career } from "./index";
import { Op } from "sequelize";

export const CareerRepository = {
  create: async ({ code, description, credits }: ICareer) => {
    const career: Career = new Career({ code, description, credits });
    return career.save();
  },
  findByCode: async (codes: string[])  =>
    Career.findAll({ where: { code: { [Op.or]: codes }} }),
  findAll: async () =>
    Career.findAll(),
  deleteByCode: async (code: string) =>
    Career.destroy({ where: { code } }),
  truncate: async () =>
    Career.destroy({ truncate: true })
};
