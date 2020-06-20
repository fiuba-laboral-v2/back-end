import { Int, List, String } from "../../fieldTypes";
import { GraphQLApplicant } from "../Types/Applicant";
import { GraphQLCareerCredits } from "../Types/CareerCredits";
import { GraphQLSectionInput } from "../Types/Section";
import { GraphQLUserUpdateInput } from "../../User/Types/GraphQLUserUpdateInput";
import { ApplicantRepository, IApplicantEditable } from "../../../models/Applicant";
import { GraphQLLinkInput } from "../Types/Link";
import { IApplicantUser } from "../../Context";

const updateCurrentApplicant = {
  type: GraphQLApplicant,
  args: {
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
  resolve: async (
    _: undefined,
    props: IApplicantEditable,
    { currentUser }: { currentUser: IApplicantUser }
  ) => ApplicantRepository.update({ ...props, uuid: currentUser.applicant.uuid })
};

export { updateCurrentApplicant };
