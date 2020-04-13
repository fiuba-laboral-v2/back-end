import { ID, nonNull } from "../../fieldTypes";
import { GraphQLApplicant } from "../Types/Applicant";

import { ApplicantRepository, ApplicantSerializer } from "../../../models/Applicant";

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
  resolve: async (_: undefined, { uuid, sectionUuid }: { uuid: string, sectionUuid: string }) => {
    const applicant = await ApplicantRepository.deleteSection(uuid, sectionUuid);
    return ApplicantSerializer.serialize(applicant);
  }
};

export { deleteSection };
