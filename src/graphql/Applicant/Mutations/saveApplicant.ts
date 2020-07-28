import { Int, List, nonNull, String } from "../../fieldTypes";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { GraphQLCareerCredits } from "../Types/CareerCredits";

import { IApplicant, ApplicantRepository } from "../../../models/Applicant";
import { GraphQLUserCreateInput } from "../../User/Types/GraphQLUserCreateInput";

const saveApplicant = {
  type: GraphQLApplicant,
  args: {
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
    },
    user: {
      type: nonNull(GraphQLUserCreateInput)
    }
  },
  resolve: (_: undefined, props: IApplicant) => ApplicantRepository.create(props)
};

export { saveApplicant };
