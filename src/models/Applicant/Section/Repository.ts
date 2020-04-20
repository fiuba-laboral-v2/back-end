import { Applicant } from "../Model";
import { Section } from ".";
import { omit } from "lodash";
import { TSection } from "../Interface";
import { Op } from "sequelize";
import isEmpty from "lodash/isEmpty";
import { Transaction } from "sequelize";

export const SectionRepository = {
  update: async (applicant: Applicant, sections: TSection[], transaction?: Transaction) => {
    const sectionsUuid: string[] = [];
    for (const section of sections) {
      sectionsUuid.push(await SectionRepository.updateOrCreate(applicant, section, transaction));
    }
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
  updateOrCreate: async (applicant: Applicant, section: TSection, transaction?: Transaction) => {
    if (section.uuid && (await applicant.hasSection(section.uuid))) {
      await Section.update(
        omit(section, [ "uuid" ]),
        { where: { uuid: section.uuid }, transaction }
      );
      return section.uuid;
    } else {
      const newSection = await applicant.createSection(section, { transaction });
      return newSection.uuid;
    }
  }
};
