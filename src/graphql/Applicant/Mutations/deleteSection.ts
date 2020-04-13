import { ID, nonNull } from "../../fieldTypes";
import { GraphQLApplicant } from "../Types/Applicant";

import { ApplicantRepository } from "../../../models/Applicant";

const deleteSection = {
  type: GraphQLApplicant,
  args: {
    uuid: {
      type: nonNull(ID)
    },
    sectionUuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { uuid, sectionUuid }: { uuid: string, sectionUuid: string }) =>
    ApplicantRepository.deleteSection(uuid, sectionUuid)
};

export { deleteSection };
