import { Applicant } from "$models";
import { IUpdate, SectionType } from "./Interfaces";

export const SectionRepository = {
  update: async ({ modelClass, sections, applicant, transaction }: IUpdate) => {
    await modelClass.destroy({
      where: { applicantUuid: applicant.uuid },
      transaction
    });

    return modelClass.bulkCreate(
      sections.map(section => ({ ...section, applicantUuid: applicant.uuid })),
      {
        transaction,
        returning: true,
        validate: true
      }
    );
  },
  findByApplicant: (applicant: Applicant, modelClass: SectionType) =>
    modelClass.findAll({
      where: {
        applicantUuid: applicant.uuid
      }
    }),
  truncate: (modelClass: SectionType) => modelClass.destroy({ truncate: true })
};
