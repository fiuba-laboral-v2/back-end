import { UserInputError } from "apollo-server";

import { ApplicantTypes } from "./types";
import { nonNull, Int } from "../fieldTypes";
import {
  ApplicantProfile,
  ApplicantProfileRepository,
  ApplicantSerializer
} from "../../models/ApplicantProfile";

const [ applicantProfileType ] = ApplicantTypes;

const applicantQueries = {
  getApplicantByPadron: {
    type: applicantProfileType,
    args: {
      padron: {
        type: nonNull(Int)
      }
    },
    resolve: async (_: undefined, { padron }) => {
      try {
        const applicant: ApplicantProfile | null = await ApplicantProfileRepository
        .findByPadron(padron);

        return applicant && ApplicantSerializer.serialize(applicant);
      } catch {
        throw new UserInputError("Applicant Not found", { invalidArgs: Object.keys(padron) });
      }
    }
  }
};

export default applicantQueries;
