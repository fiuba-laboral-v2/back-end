import { Int, List, nonNull, String } from "$graphql/fieldTypes";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { GraphQLApplicantCareerInput } from "../Types/GraphQLApplicantCareerInput";

import { ApplicantRepository, ISaveApplicant } from "$models/Applicant";
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
      type: nonNull(List(GraphQLApplicantCareerInput))
    },
    capabilities: {
      type: List(String)
    },
    user: {
      type: nonNull(GraphQLUserCreateInput)
    }
  },
  resolve: (_: undefined, props: ISaveApplicant) => ApplicantRepository.create(props)
};

export { saveApplicant };
