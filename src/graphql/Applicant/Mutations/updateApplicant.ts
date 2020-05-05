import { ID, Int, List, nonNull, String } from "../../fieldTypes";
import { GraphQLApplicant } from "../Types/Applicant";
import { GraphQLCareerCredits } from "../Types/CareerCredits";
import { GraphQLSectionInput } from "../Types/Section";
import { GraphQLUserUpdateInput } from "../../User/Types/GraphQLUserUpdateInput";

import { IApplicantEditable, ApplicantRepository } from "../../../models/Applicant";
import { GraphQLLinkInput } from "../Types/Link";

const updateApplicant = {
  type: GraphQLApplicant,
  args: {
    uuid: {
      type: nonNull(ID)
    },
    user: {
      type: GraphQLUserUpdateInput
    },
    padron: {
      type: Int
    },
    description: {
      type: String
    },
    careers: {
      type: List(GraphQLCareerCredits)
    },
    capabilities: {
      type: List(String)
    },
    sections: {
      type: List(GraphQLSectionInput)
    },
    links: {
      type: List(GraphQLLinkInput)
    }
  },
  resolve: (_: undefined, props: IApplicantEditable) => ApplicantRepository.update(props)
};

export { updateApplicant };
