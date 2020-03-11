import { Applicant, IApplicantCareer } from "../Applicant";
import find from "lodash/find";
import { CareerApplicant } from "./Model";
import { Transaction } from "sequelize";
import { CareerRepository } from "../Career";

export const CareerApplicantRepository = {
  updateOrCreate: async (
    applicant: Applicant,
    applicantCareer: IApplicantCareer,
    transaction?: Transaction
  ) => {
    const career = find(applicant.careers, c => c.code === applicantCareer.code);
    if (!career) {
      await CareerApplicantRepository.create(applicant, applicantCareer, transaction);
      const newCareer = await CareerRepository.findByCode(applicantCareer.code);
      applicant.careers = applicant.careers || [];
      return applicant.careers.push(newCareer);
    }

    return career.CareerApplicant.update(
      { creditsCount: applicantCareer!.creditsCount },
      { validate: true, transaction: transaction }
    );
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
