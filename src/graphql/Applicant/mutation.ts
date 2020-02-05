import { ApplicantTypes } from "./types";
import { Int, List, nonNull, String } from "../fieldTypes";

import {
  ApplicantProfile,
  IApplicantProfile,
  ApplicantProfileRepository,
  ApplicantSerializer
} from "../../models/ApplicantProfile";

const [applicantProfileType] = ApplicantTypes;

const applicantMutations = {
  saveApplicant: {
    type: applicantProfileType,
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
      degree: {
        type: nonNull(List(String))
      },
      capabilities: {
        type: List(String)
      }
    },
    resolve: async (_: undefined, props: IApplicantProfile) => {
      const newCareer: ApplicantProfile = await ApplicantProfileRepository.create(props);
      return ApplicantSerializer.serialize(newCareer);
    }
  }
};

export default applicantMutations;
