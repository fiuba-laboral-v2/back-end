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
  bulkCreate: async (
    applicantCareers: IApplicantCareer[],
    applicant: Applicant,
    transaction?: Transaction
  ) => {
    return CareerApplicant.bulkCreate(
      applicantCareers.map(applicantCareer => (
      {
        careerCode: applicantCareer.code,
        applicantUuid: applicant.uuid,
        creditsCount: applicantCareer.creditsCount
      }
      ))
      ,
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

    return CareerApplicant.bulkCreate(
      applicantCareers.map(applicantCareer =>
        ({
          careerCode: applicantCareer.code,
          applicantUuid: applicant.uuid,
          creditsCount: applicantCareer.creditsCount
        })
      ),
      { transaction }
    );
  },
  truncate: async () =>
    CareerApplicant.truncate({ cascade: true })
};
