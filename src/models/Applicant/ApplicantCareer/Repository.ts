import { IApplicantCareer } from "$models/Applicant/ApplicantCareer";
import { ApplicantCareerNotFound } from "./Errors";
import { Transaction } from "sequelize";
import { Applicant, ApplicantCareer } from "$models";

export const ApplicantCareersRepository = {
  findByApplicantAndCareer: async (applicantUuid: string, careerCode: string) => {
    const applicantCareer = await ApplicantCareer.findOne({
      where: { applicantUuid, careerCode }
    });
    if (!applicantCareer) throw new ApplicantCareerNotFound(applicantUuid, careerCode);

    return applicantCareer;
  },
  bulkCreate: async (
    applicantCareers: IApplicantCareer[],
    { uuid: applicantUuid }: Applicant,
    transaction?: Transaction
  ) => ApplicantCareer.bulkCreate(
    applicantCareers.map(applicantCareer => ({ ...applicantCareer, applicantUuid })),
    { transaction, validate: true }
  ),
  update: async (
    applicantCareers: IApplicantCareer[],
    { uuid: applicantUuid }: Applicant,
    transaction?: Transaction
  ) => {
    await ApplicantCareer.destroy({ where: { applicantUuid }, transaction });
    return ApplicantCareer.bulkCreate(
      applicantCareers.map(applicantCareer => ({ ...applicantCareer, applicantUuid })),
      { transaction, validate: true }
    );
  },
  findAll: () => ApplicantCareer.findAll(),
  truncate: async () => ApplicantCareer.truncate({ cascade: true })
};
