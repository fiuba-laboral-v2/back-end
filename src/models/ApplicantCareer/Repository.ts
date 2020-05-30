import { Applicant, IApplicantCareer } from "../Applicant";
import { ApplicantCareer } from "./Model";
import { ApplicantCareerNotFound } from "./Errors";
import { Transaction } from "sequelize";

export const ApplicantCareersRepository = {
  findByApplicantAndCareer: async (applicantUuid: string, careerCode: string) => {
    const applicantCareer = await ApplicantCareer.findOne({
      where: { applicantUuid: applicantUuid, careerCode: careerCode }
    });
    if (!applicantCareer) throw new ApplicantCareerNotFound(applicantUuid, careerCode);

    return applicantCareer;
  },
  bulkCreate: async (
    applicantCareers: IApplicantCareer[],
    applicant: Applicant,
    transaction?: Transaction
  ) => {
    return ApplicantCareer.bulkCreate(
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
    await ApplicantCareer.destroy({
      where: {
        applicantUuid: applicant.uuid
      },
      transaction
    });

    return ApplicantCareer.bulkCreate(
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
    ApplicantCareer.truncate({ cascade: true })
};