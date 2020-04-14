import { TLink } from "./Interface";
import { Applicant } from "../Model";
import { ApplicantLink } from ".";
import { Op } from "sequelize";
import { omit, isEmpty } from "lodash";
import { Transaction } from "sequelize";

export const ApplicantLinkRepository = {
  update: async (applicant: Applicant, links: TLink[], transaction?: Transaction) => {
    const linksUuid: string[] = [];
    for (const link of links) {
      linksUuid.push(await ApplicantLinkRepository.updateOrCreate(applicant, link, transaction));
    }
    return ApplicantLink.destroy({
      where: {
        applicantUuid: applicant.uuid,
        ...(!isEmpty(linksUuid) && {
          [Op.not]: {
            uuid: linksUuid
          }
        })
      },
      transaction
    });
  },
  updateOrCreate: async (applicant: Applicant, link: TLink, transaction?: Transaction) => {
    if (link.uuid && (await applicant.hasLink(link.uuid))) {
      await ApplicantLink.update(omit(link, ["uuid"]), { where: { uuid: link.uuid }, transaction });
      return link.uuid;
    }
    const newLink = await applicant.createLink(link, { transaction });
    return newLink.uuid;
  }
};
