import { Applicant } from "../Model";
import { Section } from ".";
import { TSection } from "../Interface";
import { Transaction } from "sequelize";

export const SectionRepository = {
  update: async (sections: TSection[], applicant: Applicant, transaction?: Transaction) => {
    await Section.destroy({
      where: {
        applicantUuid: applicant.uuid
      },
      transaction
    });

    return SectionRepository.bulkUpsert(sections, applicant, transaction);
  },
  bulkUpsert: (sections: TSection[], applicant: Applicant, transaction?: Transaction) => {
    return Section.bulkCreate(
      sections.map(section => ({ ...section, applicantUuid: applicant.uuid })),
      {
        transaction,
        returning: true,
        validate: true,
        updateOnDuplicate: ["title", "text", "displayOrder"]
      }
    );
  }
};
