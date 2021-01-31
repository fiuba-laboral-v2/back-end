import { TLink } from "./Interface";
import { Applicant, ApplicantLink } from "$models";
import { Transaction } from "sequelize";

export const ApplicantLinkRepository = {
  update: async (links: TLink[], applicant: Applicant, transaction?: Transaction) => {
    await ApplicantLink.destroy({ where: { applicantUuid: applicant.uuid } });
    await ApplicantLinkRepository.bulkUpsert(links, applicant, transaction);
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
  },
  truncate: () => ApplicantLink.truncate({ cascade: true })
};
