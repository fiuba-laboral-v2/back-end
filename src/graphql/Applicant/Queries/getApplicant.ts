import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { nonNull, ID } from "../../fieldTypes";
import { ApplicantRepository } from "../../../models/Applicant";

const getApplicant = {
  type: GraphQLApplicant,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: (_: undefined, { uuid }) => ApplicantRepository.findByUuid(uuid)
};

export { getApplicant };
