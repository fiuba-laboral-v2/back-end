import { UserInputError } from "apollo-server";

import { GraphQLApplicant } from "./Types/Applicant";
import { nonNull, Int } from "../fieldTypes";
import {
  ApplicantRepository,
  ApplicantSerializer
} from "../../models/Applicant";

const applicantQueries = {
  getApplicantByPadron: {
    type: GraphQLApplicant,
    args: {
      padron: {
        type: nonNull(Int)
      }
    },
    resolve: async (_: undefined, { padron }) => {
      const applicant = await ApplicantRepository.findByPadron(padron);

      return ApplicantSerializer.serialize(applicant);
    }
  }
};

export default applicantQueries;
