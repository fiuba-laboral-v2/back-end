import { ApplicantCareersIncludeClauseBuilder } from "$models/QueryBuilder";
import { ApplicantType } from "$models/Applicant";
import { ApplicantCareer } from "$models";
import { Op } from "sequelize";

describe("ApplicantCareersIncludeClauseBuilder", () => {
  it("returns a clause for students and the given career codes", () => {
    const applicantType = ApplicantType.student;
    const careerCodes = ["1", "2"];
    const clause = ApplicantCareersIncludeClauseBuilder.build({ careerCodes, applicantType });
    expect(clause).toEqual({
      model: ApplicantCareer,
      where: {
        careerCode: { [Op.in]: careerCodes },
        isGraduate: false
      },
      attributes: []
    });
  });

  it("returns a clause for graduates and the given career codes", () => {
    const applicantType = ApplicantType.graduate;
    const careerCodes = ["1", "2"];
    const clause = ApplicantCareersIncludeClauseBuilder.build({ careerCodes, applicantType });
    expect(clause).toEqual({
      model: ApplicantCareer,
      where: {
        careerCode: { [Op.in]: careerCodes },
        isGraduate: true
      },
      attributes: []
    });
  });

  it("returns a clause for both students and graduates and the given career codes", () => {
    const applicantType = ApplicantType.both;
    const careerCodes = ["1", "2"];
    const clause = ApplicantCareersIncludeClauseBuilder.build({ careerCodes, applicantType });
    expect(clause).toEqual({
      model: ApplicantCareer,
      where: {
        careerCode: { [Op.in]: careerCodes }
      },
      attributes: []
    });
  });

  it("returns a clause for the given career codes", () => {
    const careerCodes = ["1", "2"];
    const clause = ApplicantCareersIncludeClauseBuilder.build({ careerCodes });
    expect(clause).toEqual({
      model: ApplicantCareer,
      where: {
        careerCode: { [Op.in]: careerCodes }
      },
      attributes: []
    });
  });

  it("returns undefined if no careerCodes or applicantType are provided", () => {
    const clause = ApplicantCareersIncludeClauseBuilder.build({});
    expect(clause).toBeUndefined();
  });
});
