import { GraphQLApplicant } from "./Types/Applicant";
import { Int, List, nonNull, String } from "../fieldTypes";

import {
  Applicant,
  IApplicant,
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
      credits: {
        type: nonNull(Int)
      },
      description: {
        type: String
      },
      careersCodes: {
        type: nonNull(List(Int))
      },
      capabilities: {
        type: List(String)
      }
    },
    resolve: async (_: undefined, props: IApplicant) => {
      const applicant: Applicant = await ApplicantRepository.create(props);
      return ApplicantSerializer.serialize(applicant);
    }
  }
};

export default applicantMutations;
