import { ID, List, nonNull, String } from "../../fieldTypes";
import { GraphQLApplicant } from "../Types/Applicant";
import {
  ApplicantRepository,
  ApplicantSerializer
} from "../../../models/Applicant";

const deleteApplicantCapabilities = {
  type: GraphQLApplicant,
  args: {
    uuid: {
      type: nonNull(ID)
    },
    capabilities: {
      type: List(String)
    }
  },
  resolve: async (
    _: undefined,
    { uuid, capabilities }: { uuid: string, capabilities: string[] }
  ) => {
    const applicant = await ApplicantRepository.findByUuid(uuid);
    await ApplicantRepository.deleteCapabilities(applicant, capabilities);
    return ApplicantSerializer.serialize(applicant);
  }
};

export { deleteApplicantCapabilities };
