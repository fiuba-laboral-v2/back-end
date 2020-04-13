import { ID, nonNull } from "../../fieldTypes";
import { GraphQLApplicant } from "../Types/Applicant";

import { ApplicantRepository } from "../../../models/Applicant";

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
  resolve: (_: undefined, { uuid, linkUuid }: { uuid: string, linkUuid: string }) =>
    ApplicantRepository.deleteLink(uuid, linkUuid)
};

export { deleteLink };
