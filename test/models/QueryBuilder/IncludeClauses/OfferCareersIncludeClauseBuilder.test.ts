import { OfferCareersIncludeClauseBuilder } from "$models/QueryBuilder";
import { OfferCareer } from "$models";
import { Op } from "sequelize";

describe("OfferCareersIncludeClauseBuilder", () => {
  it("returns a clause for the given career codes", () => {
    const careerCodes = ["1", "2"];
    const clause = OfferCareersIncludeClauseBuilder.build({ careerCodes });
    expect(clause).toEqual({
      model: OfferCareer,
      where: {
        careerCode: { [Op.in]: careerCodes }
      },
      attributes: []
    });
  });

  it("returns a clause for no career codes", () => {
    const careerCodes = [];
    const clause = OfferCareersIncludeClauseBuilder.build({ careerCodes });
    expect(clause).toEqual({
      model: OfferCareer,
      where: {
        careerCode: { [Op.in]: careerCodes }
      },
      attributes: []
    });
  });

  it("returns undefined if no careerCodes provided", () => {
    const clause = OfferCareersIncludeClauseBuilder.build({});
    expect(clause).toBeUndefined();
  });
});
