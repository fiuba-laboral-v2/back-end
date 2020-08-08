import { Int, List, nonNull, String } from "$graphql/fieldTypes";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { GraphQLCareerCredits } from "../Types/CareerCredits";

import { ICreateApplicant, ApplicantRepository } from "$models/Applicant";
import { GraphQLUserCreateInput } from "$graphql/User/Types/GraphQLUserCreateInput";

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
  resolve: (_: undefined, props: ICreateApplicant) => ApplicantRepository.create(props)
};

export { saveApplicant };
