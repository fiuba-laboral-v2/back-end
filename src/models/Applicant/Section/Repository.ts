import { Applicant } from "../Model";
import { Section } from ".";
import { omit } from "lodash";
import { TSection } from "../Interface";
import { Op } from "sequelize";
import isEmpty from "lodash/isEmpty";
import { Transaction } from "sequelize";

export const SectionRepository = {
  update: async (sections: TSection[], applicant: Applicant, transaction?: Transaction) => {
    const sectionsUuid: string[] = [];
    for (const section of sections) {
      sectionsUuid.push(await SectionRepository.updateOrCreate(section, applicant, transaction));
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
  updateOrCreate: async (section: TSection, applicant: Applicant, transaction?: Transaction) => {
    if (section.uuid && (await applicant.hasSection(section.uuid))) {
      await Section.update(
        omit(section, ["uuid"]),
        { where: { uuid: section.uuid }, transaction }
      );
      return section.uuid;
    } else {
      const newSection = await applicant.createSection(section, { transaction });
      return newSection.uuid;
    }
  }
};
