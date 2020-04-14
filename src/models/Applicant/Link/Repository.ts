import { TLink } from "./Interface";
import { Applicant } from "../Model";
import { ApplicantLink } from ".";
import { Op } from "sequelize";
import { omit, isEmpty } from "lodash";

export const ApplicantLinkRepository = {
  update: async (applicant: Applicant, links: TLink[]) => {
    const linksUuid: string[] = [];
    for (const link of links) {
      linksUuid.push(await ApplicantLinkRepository.updateOrCreate(applicant, link));
    }
    ApplicantLink.destroy({
      where: {
        applicantUuid: applicant.uuid,
        ...(!isEmpty(linksUuid) && {
          [Op.not]: {
            uuid: linksUuid
          }
        })
      }
    });
  },
  updateOrCreate: async (applicant: Applicant, link: TLink) => {
    if (link.uuid && (await applicant.hasLink(link.uuid))) {
      await ApplicantLink.update(omit(link, ["uuid"]), { where: { uuid: link.uuid } });
      return link.uuid;
    }
    const newLink = await applicant.createLink(link);
    return newLink.uuid;
  }
};
