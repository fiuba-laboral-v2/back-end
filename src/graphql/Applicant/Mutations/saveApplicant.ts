import { Int, List, nonNull, String } from "../../fieldTypes";
import { GraphQLApplicant } from "../Types/Applicant";
import { GraphQLCareerCredits } from "../Types/CareerCredits";

import {
  IApplicant,
  ApplicantRepository,
  ApplicantSerializer
} from "../../../models/Applicant";

const saveApplicant = {
  type: GraphQLApplicant,
  args: {
    name: {
      type: nonNull(String)
    },
    surname: {
      type: nonNull(String)
    },
    padron: {
      type: nonNull(Int)
    },
    description: {
      type: String
    },
    careers: {
      type: nonNull(List(GraphQLCareerCredits))
    },
    capabilities: {
      type: List(String)
    }
  },
  resolve: async (_: undefined, props: IApplicant) => {
    const applicant = await ApplicantRepository.create(props);
    return ApplicantSerializer.serialize(applicant);
  }
};

export { saveApplicant };
