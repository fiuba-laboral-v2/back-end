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
    applicant: Applicant,
    applicantCareer: IApplicantCareer,
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
    applicant: Applicant,
    applicantCareers: IApplicantCareer[]
    // transaction?: Transaction
  ) => {
    await CareerApplicant.destroy({
      where: {
        applicantUuid: applicant.uuid
      }
    });

    for (const applicantCareer of applicantCareers) {
      await CareerApplicantRepository.create(
        applicant,
        applicantCareer
        // transaction
      );
    }
  },
  truncate: async () =>
    CareerApplicant.truncate({ cascade: true })
};
