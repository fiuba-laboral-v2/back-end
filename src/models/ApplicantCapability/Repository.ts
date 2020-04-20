import { Applicant } from "../Applicant";
import { ApplicantCapability } from "./Model";
import { Transaction } from "sequelize";

import { CapabilityRepository } from "../Capability";

export const ApplicantCapabilityRepository = {
  update: async (
    newCapabilities: string[],
    applicant: Applicant,
    transaction?: Transaction
  ) => {
    await ApplicantCapability.destroy({
      where: {
        applicantUuid: applicant.uuid
      },
      transaction
    });

    const capabilities = await CapabilityRepository.findOrCreateByDescriptions(newCapabilities);

    for (const capability of capabilities) {
      await ApplicantCapability.create(
        {
          applicantUuid: applicant.uuid,
          capabilityUuid: capability.uuid
        },
        {
          transaction
        }
      );
    }
  },
  truncate: async () =>
    ApplicantCapability.truncate({ cascade: true })
};
