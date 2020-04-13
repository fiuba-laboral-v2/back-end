import { ID, nonNull } from "../../fieldTypes";
import { GraphQLApplicant } from "../Types/Applicant";

import { ApplicantRepository, ApplicantSerializer } from "../../../models/Applicant";

const deleteLink = {
  type: GraphQLApplicant,
  args: {
    uuid: {
      type: nonNull(ID)
    },
    linkUuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { uuid, linkUuid }: { uuid: string, linkUuid: string }) => {
    const applicant = await ApplicantRepository.deleteLink(uuid, linkUuid);
    return ApplicantSerializer.serialize(applicant);
  }
};

export { deleteLink };
