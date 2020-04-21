import { TLink } from "./Interface";
import { Applicant } from "../Model";
import { ApplicantLink } from ".";
import { Op } from "sequelize";
import { omit, isEmpty } from "lodash";
import { Transaction } from "sequelize";

export const ApplicantLinkRepository = {
  update: async (links: TLink[], applicant: Applicant, transaction?: Transaction) => {
    const linkUuids = await Promise.all(links.map(
      async link =>
        (await ApplicantLinkRepository.updateOrCreate(link, applicant, transaction)).uuid
    ));

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
      const [, result] = await ApplicantLink.update(
        omit(link, ["uuid"]),
        { where: { uuid: link.uuid }, transaction, returning: true }
      );
      const [updatedApplicantLink] = result;
      return updatedApplicantLink;
    }
    return await applicant.createLink(link, { transaction });
  }
};
