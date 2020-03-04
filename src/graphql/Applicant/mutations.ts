import { GraphQLApplicant } from "./Types/Applicant";
import { GraphQLCareerCredits } from "./Types/CareerCredits";
import { Int, List, nonNull, String } from "../fieldTypes";

import {
  IApplicant,
  IApplicantEditable,
  ApplicantRepository,
  ApplicantSerializer
} from "../../models/Applicant";

const applicantMutations = {
  saveApplicant: {
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
  },
  updateApplicant: {
    type: GraphQLApplicant,
    args: {
      name: {
        type: String
      },
      surname: {
        type: String
      },
      padron: {
        type: nonNull(Int)
      },
      description: {
        type: String
      },
      careers: {
        type: List(GraphQLCareerCredits)
      },
      capabilities: {
        type: List(String)
      }
    },
    resolve: async (_: undefined, props: IApplicantEditable) => {
      const applicant = await ApplicantRepository.findByPadron(props.padron);
      await ApplicantRepository.update(applicant, props);
      return ApplicantSerializer.serialize(applicant);
    }
  }
};

export default applicantMutations;
