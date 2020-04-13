import { GraphQLApplicant } from "../Types/Applicant";
import { nonNull, Int } from "../../fieldTypes";
import { ApplicantRepository } from "../../../models/Applicant";

const getApplicantByPadron = {
  type: GraphQLApplicant,
  args: {
    padron: {
      type: nonNull(Int)
    }
  },
  resolve: (_: undefined, { padron }) => ApplicantRepository.findByPadron(padron)
};

export { getApplicantByPadron };
