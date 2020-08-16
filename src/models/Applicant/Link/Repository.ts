import { TLink } from "./Interface";
import { Applicant, ApplicantLink } from "../..";
import { Op, Transaction } from "sequelize";
import { isEmpty } from "lodash";

export const ApplicantLinkRepository = {
  update: async (links: TLink[], applicant: Applicant, transaction?: Transaction) => {
    const linkNames: string[] = (
      await ApplicantLinkRepository.bulkUpsert(links, applicant, transaction)
    ).map(({ name }) => name);

    return ApplicantLink.destroy({
      where: {
        applicantUuid: applicant.uuid,
        ...(!isEmpty(linkNames) && {
          [Op.not]: {
            name: linkNames
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
        updateOnDuplicate: ["url"]
      }
    );
  }
};
