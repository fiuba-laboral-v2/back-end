import { Applicant } from "../Model";
import { Section } from ".";
import { omit } from "lodash";
import { TSection } from "../Interface";
import { Op } from "sequelize";
import isEmpty from "lodash/isEmpty";
import { Transaction } from "sequelize";

export const SectionRepository = {
  update: async (sections: TSection[], applicant: Applicant, transaction?: Transaction) => {
    const sectionsUuid = await Promise.all(sections.map(
      async section =>
        (await SectionRepository.updateOrCreate(section, applicant, transaction)).uuid
    ));

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
      const [, result] = await Section.update(
        omit(section, ["uuid"]),
        { where: { uuid: section.uuid }, transaction, returning: true }
      );
      const [updatedSection] = result;
      return updatedSection;
    } else {
      return applicant.createSection(section, { transaction });
    }
  }
};
