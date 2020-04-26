import { TLink } from "./Interface";
import { Applicant } from "../Model";
import { ApplicantLink } from ".";
import { Op } from "sequelize";
import { isEmpty } from "lodash";
import { Transaction } from "sequelize";

export const ApplicantLinkRepository = {
  update: async (links: TLink[], applicant: Applicant, transaction?: Transaction) => {
    const linkUuids: string[] =
      (await ApplicantLinkRepository.bulkUpsert(links, applicant, transaction))
        .map(({ uuid }) => (uuid));

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
  bulkUpsert: (links: TLink[], applicant: Applicant, transaction?: Transaction) => {
    return ApplicantLink.bulkCreate(
      links.map(link => ({ ...link, applicantUuid: applicant.uuid })),
      {
        transaction,
        validate: true,
        returning: true,
        updateOnDuplicate: ["name", "url"]
      }
    );
  }
};
