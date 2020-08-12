import { Int, List, String } from "$graphql/fieldTypes";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { GraphQLApplicantCareerInput } from "../Types/GraphQLApplicantCareerInput";
import { GraphQLSectionInput } from "../Types/Section";
import { GraphQLUserUpdateInput } from "$graphql/User/Types/GraphQLUserUpdateInput";
import { ApplicantRepository, IApplicantEditable } from "$models/Applicant";
import { GraphQLLinkInput } from "../Types/Link";
import { IApplicantUser } from "$graphql/Context";

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
      type: List(GraphQLApplicantCareerInput)
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
