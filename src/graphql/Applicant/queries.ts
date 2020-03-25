import { GraphQLApplicant } from "./Types/Applicant";
import { nonNull, Int, List, ID } from "../fieldTypes";
import {
  ApplicantRepository,
  ApplicantSerializer
} from "../../models/Applicant";

const applicantQueries = {
  getApplicant: {
    type: GraphQLApplicant,
    args: {
      uuid: {
        type: nonNull(ID)
      }
    },
    resolve: async (_: undefined, { uuid }) => {
      const applicant = await ApplicantRepository.findByUuid(uuid);
      return ApplicantSerializer.serialize(applicant);
    }
  },
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
  },
  getApplicants: {
    type: List(GraphQLApplicant),
    resolve: async () => {
      const applicants = await ApplicantRepository.findAll();
      return applicants.map(applicant => ApplicantSerializer.serialize(applicant));
    }
  }
};

export default applicantQueries;
