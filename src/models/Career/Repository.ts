import { ICareer } from "./index";
import { Op } from "sequelize";
import { ApplicantCareer, Career } from "$models";
import { Database } from "$config/Database";
import { CareersNotFound } from "./Errors/CareersNotFound";

import difference from "lodash/difference";
import map from "lodash/map";

export const CareerRepository = {
  create: (attributes: ICareer) => Career.create(attributes),
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
  findAll: () => Career.findAll(),
  deleteByCode: (code: string) => Database.transaction(async transaction => {
    await ApplicantCareer.destroy({ where: { careerCode: code }, transaction });
    return Career.destroy({ where: { code }, transaction });
  }),
  truncate: () => Career.truncate({ cascade: true })
};
