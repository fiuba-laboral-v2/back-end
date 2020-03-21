import { Applicant, IApplicantCareer } from "../Applicant";
import { CareerApplicant } from "./Model";
import { CareerApplicantNotFound } from "./Errors";
import { Transaction } from "sequelize";

export const CareerApplicantRepository = {
  updateOrCreate: async (
    applicant: Applicant,
    applicantCareer: IApplicantCareer,
    transaction?: Transaction
  ) => {
    const career = (await applicant.getCareers()).find(c => c.code === applicantCareer.code);
    if (!career) {
      return CareerApplicantRepository.create(
        applicant,
        applicantCareer,
        transaction
      );
    }
    const careerApplicant = await CareerApplicantRepository.findByApplicantAndCareer(
      applicant.uuid,
      career.code
    );
    return careerApplicant!.update(
      { creditsCount: applicantCareer!.creditsCount },
      { validate: true, transaction: transaction }
    );
  },
  findByApplicantAndCareer: async (applicantUuid: string, careerCode: string) => {
    const careerApplicant =  await CareerApplicant.findOne({
      where: { applicantUuid: applicantUuid, careerCode: careerCode  }
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
  truncate: async () =>
    CareerApplicant.truncate({ cascade: true })
};
