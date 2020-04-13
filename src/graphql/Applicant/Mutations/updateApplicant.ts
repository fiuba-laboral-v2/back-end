import { ID, Int, List, nonNull, String } from "../../fieldTypes";
import { GraphQLApplicant } from "../Types/Applicant";
import { GraphQLCareerCredits } from "../Types/CareerCredits";
import { GraphQLSectionInput } from "../Types/Section";

import {
  IApplicantEditable,
  ApplicantRepository,
  ApplicantSerializer
} from "../../../models/Applicant";
import { GraphQLLinkInput } from "../Types/Link";

const updateApplicant = {
  type: GraphQLApplicant,
  args: {
    uuid: {
      type: nonNull(ID)
    },
    name: {
      type: String
    },
    surname: {
      type: String
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
  resolve: async (_: undefined, props: IApplicantEditable) => {
    const applicant = await ApplicantRepository.update(props);
    return ApplicantSerializer.serialize(applicant);
  }
};

export { updateApplicant };
