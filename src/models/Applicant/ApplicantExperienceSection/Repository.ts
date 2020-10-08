import { Applicant, ApplicantExperienceSection } from "$models";
import { IUpdate } from "./Interfaces";

export const ApplicantExperienceSectionRepository = {
  update: async ({ sections, applicant, transaction }: IUpdate) => {
    await ApplicantExperienceSection.destroy({
      where: { applicantUuid: applicant.uuid },
      transaction
    });

    return ApplicantExperienceSection.bulkCreate(
      sections.map(section => ({ ...section, applicantUuid: applicant.uuid })),
      {
        transaction,
        returning: true,
        validate: true
      }
    );
  },
  findByApplicant: (applicant: Applicant) =>
    ApplicantExperienceSection.findAll({
      where: {
        applicantUuid: applicant.uuid
      }
    }),
  truncate: () => ApplicantExperienceSection.destroy({ truncate: true })
};
