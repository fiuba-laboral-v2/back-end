import { GraphQLApplicant } from "../Types/Applicant";
import { nonNull, ID } from "../../fieldTypes";
import { ApplicantRepository, ApplicantSerializer } from "../../../models/Applicant";

const getApplicant = {
  type: GraphQLApplicant,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { uuid }) => {
    const applicant = await ApplicantRepository.findByUuid(uuid);
    return ApplicantSerializer.serialize(applicant);
  }
};

export { getApplicant };
