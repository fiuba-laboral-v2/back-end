import { TLink } from "./Interface";
import { Applicant } from "../Model";
import { ApplicantLink } from ".";
import { Op } from "sequelize";
import { isEmpty } from "lodash";
import { Transaction } from "sequelize";

export const ApplicantLinkRepository = {
  update: async (links: TLink[], applicant: Applicant, transaction?: Transaction) => {
    await ApplicantLink.destroy({
      where: {
        applicantUuid: applicant.uuid
      },
      transaction
    });

    return ApplicantLink.bulkCreate(
      links.map(link => ({ ...link, applicantUuid: applicant.uuid })),
      {
        transaction,
        validate: true,
        returning: true
      }
    );
  }
};
