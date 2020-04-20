import { Applicant, IApplicantCareer } from "../Applicant";
import { CareerApplicant } from "./Model";
import { CareerApplicantNotFound } from "./Errors";
import { Transaction } from "sequelize";

export const CareerApplicantRepository = {
  findByApplicantAndCareer: async (applicantUuid: string, careerCode: string) => {
    const careerApplicant = await CareerApplicant.findOne({
      where: { applicantUuid: applicantUuid, careerCode: careerCode }
    });
    if (!careerApplicant) throw new CareerApplicantNotFound(applicantUuid, careerCode);

    return careerApplicant;
  },
  create: async (
    applicantCareer: IApplicantCareer,
    applicant: Applicant,
    transaction?: Transaction
  ) => {
    return CareerApplicant.create(
      {
        careerCode: applicantCareer.code,
        applicantUuid: applicant.uuid,
        creditsCount: applicantCareer.creditsCount
      },
      { transaction }
    );
  },
  update: async (
    applicantCareers: IApplicantCareer[],
    applicant: Applicant,
    transaction?: Transaction
  ) => {
    await CareerApplicant.destroy({
      where: {
        applicantUuid: applicant.uuid
      },
      transaction
    });

    for (const applicantCareer of applicantCareers) {
      await CareerApplicantRepository.create(
        applicantCareer,
        applicant,
        transaction
      );
    }
  },
  truncate: async () =>
    CareerApplicant.truncate({ cascade: true })
};
