import { TLink } from "./Interface";
import { Applicant } from "../Model";
import { ApplicantLink } from ".";
import { Op } from "sequelize";
import { omit, isEmpty } from "lodash";
import { Transaction } from "sequelize";

export const ApplicantLinkRepository = {
  update: async (links: TLink[], applicant: Applicant, transaction?: Transaction) => {
    const linkUuids: string[] = [];
    for (const link of links) {
      linkUuids.push(await ApplicantLinkRepository.updateOrCreate(link, applicant, transaction));
    }
    return ApplicantLink.destroy({
      where: {
        applicantUuid: applicant.uuid,
        ...(!isEmpty(linkUuids) && {
          [Op.not]: {
            uuid: linkUuids
          }
        })
      },
      transaction
    });
  },
  updateOrCreate: async (link: TLink, applicant: Applicant, transaction?: Transaction) => {
    if (link.uuid && (await applicant.hasLink(link.uuid))) {
      await ApplicantLink.update(
        omit(link, ["uuid"]),
        { where: { uuid: link.uuid }, transaction }
      );
      return link.uuid;
    }
    const newLink = await applicant.createLink(link, { transaction });
    return newLink.uuid;
  }
};
