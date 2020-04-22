import { Applicant } from "../Model";
import { Section } from ".";
import { TSection } from "../Interface";
import { Op } from "sequelize";
import isEmpty from "lodash/isEmpty";
import { Transaction } from "sequelize";

export const SectionRepository = {
  update: async (sections: TSection[], applicant: Applicant, transaction?: Transaction) => {
    const sectionsUuid: string[] =
      (await SectionRepository.bulkUpsert(sections, applicant, transaction))
        .map(({ uuid }) => (uuid));

    return Section.destroy({
      where: {
        applicantUuid: applicant.uuid,
        ...(!isEmpty(sectionsUuid) && {
          [Op.not]: {
            uuid: sectionsUuid
          }
        })
      },
      transaction
    });
  },
  bulkUpsert: (sections: TSection[], applicant: Applicant, transaction?: Transaction) => {
    return Section.bulkCreate(
      sections.map(section => ({ ...section, applicantUuid: applicant.uuid })),
      {
        transaction,
        validate: true,
        returning: true,
        updateOnDuplicate: ["title", "text", "displayOrder"]
      }
    );
  }
};
