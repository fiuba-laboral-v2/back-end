import { Applicant, ApplicantKnowledgeSection } from "$models";
import { TSection } from "../Interface";
import { Transaction } from "sequelize";

export const ApplicantKnowledgeSectionRepository = {
  update: async (sections: TSection[], applicant: Applicant, transaction?: Transaction) => {
    await ApplicantKnowledgeSection.destroy({
      where: {
        applicantUuid: applicant.uuid
      },
      transaction
    });

    return ApplicantKnowledgeSection.bulkCreate(
      sections.map(section => ({
        ...section,
        applicantUuid: applicant.uuid
      })),
      {
        transaction,
        returning: true,
        validate: true,
        updateOnDuplicate: ["title", "text", "displayOrder"]
      }
    );
  },
  truncate: () => ApplicantKnowledgeSection.destroy({ truncate: true })
};
