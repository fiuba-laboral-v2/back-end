import { GraphQLApplicant } from "../Types/Applicant";
import { nonNull, Int } from "../../fieldTypes";
import { ApplicantRepository, ApplicantSerializer } from "../../../models/Applicant";

const getApplicantByPadron = {
  type: GraphQLApplicant,
  args: {
    padron: {
      type: nonNull(Int)
    }
  },
  resolve: async (_: undefined, { padron }) => {
    const applicant = await ApplicantRepository.findByPadron(padron);
    return ApplicantSerializer.serialize(applicant);
  }
};

export { getApplicantByPadron };
