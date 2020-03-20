import { Applicant, IApplicantCareer } from "../Applicant";
import { Career, CareerRepository } from "../Career";
import find from "lodash/find";
import { CareerApplicant } from "./Model";
import { Transaction } from "sequelize";

export const CareerApplicantRepository = {
  updateOrCreate: async (
    applicant: Applicant,
    applicantCareer: IApplicantCareer,
    transaction?: Transaction
  ) => {
    const career = find(applicant.careers, c => c.code === applicantCareer.code);
    if (!career) {
      const newCareerApplicant = await CareerApplicantRepository.create(
        applicant,
        applicantCareer,
        transaction
      );
      newCareerApplicant.career = await CareerRepository.findByCode(applicantCareer.code);
      newCareerApplicant.applicant = applicant;
      applicant.careers.push(newCareerApplicant.career);
      return newCareerApplicant;
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
    const careerApplicant =  CareerApplicant.findOne({
      where: { applicantUuid: applicantUuid, careerCode: careerCode  },
      include: [ Career, Applicant ]
    });
    if (!careerApplicant) throw new Error("careerApplicant not found");

    return careerApplicant;
  },
  findByApplicant: async (applicantUuid: string) => {
    return CareerApplicant.findAll({
      where: { applicantUuid: applicantUuid },
      include: [ Career, Applicant ]
    });
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
