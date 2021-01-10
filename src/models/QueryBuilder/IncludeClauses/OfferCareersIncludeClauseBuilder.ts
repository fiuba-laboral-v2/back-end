import { OfferCareer } from "$models";
import { Op } from "sequelize";
import { Includeable } from "sequelize/types/lib/model";

export const OfferCareersIncludeClauseBuilder = {
  build: ({ careerCodes }: IBuild): Includeable | undefined => {
    if (!careerCodes) return;
    return {
      model: OfferCareer,
      where: {
        ...(careerCodes && { careerCode: { [Op.in]: careerCodes } })
      },
      attributes: []
    };
  }
};

interface IBuild {
  careerCodes?: string[];
}
