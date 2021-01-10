import { ApplicantType } from "$models/Applicant/Interface";
import { ApplicantCareer } from "$models";
import { Op } from "sequelize";
import { Includeable } from "sequelize/types/lib/model";

export const ApplicantCareersIncludeClauseBuilder = {
  build: ({ applicantType, careerCodes }: IBuild): Includeable | undefined => {
    if (!careerCodes && !applicantType) return;
    return {
      model: ApplicantCareer,
      where: {
        ...(careerCodes && { careerCode: { [Op.in]: careerCodes } }),
        ...(applicantType === ApplicantType.graduate && { isGraduate: true }),
        ...(applicantType === ApplicantType.student && { isGraduate: false })
      },
      attributes: []
    };
  }
};

interface IBuild {
  careerCodes?: string[];
  applicantType?: ApplicantType;
}
