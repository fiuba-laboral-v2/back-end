import { Applicant } from "../Model";
import { Section } from ".";
import { omit } from "lodash";
import { TSection } from "../Interface";

export const SectionRepository = {
  updateOrCreate: async (applicant: Applicant, section: TSection) => {
    if (section.uuid && (await applicant.hasSection(section.uuid))) {
      return Section.update(omit(section, ["uuid"]), { where: { uuid: section.uuid } });
    } else {
      return applicant.createSection(section);
    }
  }
};
