import { TLink } from "./Interface";
import { Applicant } from "../Model";
import { ApplicantLink } from ".";
import { omit } from "lodash";

export const ApplicantLinkRepository = {
  updateOrCreate: async (applicant: Applicant, link: TLink) => {
    if (link.uuid && (await applicant.hasLink(link.uuid))) {
      return ApplicantLink.update(omit(link, ["uuid"]), { where: { uuid: link.uuid } });
    }
    return applicant.createLink(link);
  }
};
