import { Applicant } from "../Model";
import { Section } from ".";
import { omit } from "lodash";
import { TSection } from "../Interface";
import { Op } from "sequelize";
import isEmpty from "lodash/isEmpty";

export const SectionRepository = {
  update: async (applicant: Applicant, sections: TSection[]) => {
    const sectionsUuid: string[] = [];
    for (const section of sections) {
      sectionsUuid.push(await SectionRepository.updateOrCreate(applicant, section));
    }
    Section.destroy({
      where: {
        applicantUuid: applicant.uuid,
        ...(!isEmpty(sectionsUuid) && {
          [Op.not]: {
            uuid: sectionsUuid
          }
        })
      }
    });
  },
  updateOrCreate: async (applicant: Applicant, section: TSection) => {
    if (section.uuid && (await applicant.hasSection(section.uuid))) {
      await Section.update(omit(section, ["uuid"]), { where: { uuid: section.uuid } });
      return section.uuid;
    } else {
      const newSection = await applicant.createSection(section);
      return newSection.uuid;
    }
  }
};
