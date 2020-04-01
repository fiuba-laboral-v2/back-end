import { GraphQLApplicant } from "./Types/Applicant";
import { GraphQLCareerCredits } from "./Types/CareerCredits";
import { GraphQLSectionInput } from "./Types/Section";

import { ID, Int, List, nonNull, String } from "../fieldTypes";

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
      }
    },
    resolve: async (_: undefined, props: IApplicantEditable) => {
      const applicant = await ApplicantRepository.update(props);
      return ApplicantSerializer.serialize(applicant);
    }
  },
  deleteApplicantCapabilities: {
    type: GraphQLApplicant,
    args: {
      uuid: {
        type: nonNull(ID)
      },
      capabilities: {
        type: List(String)
      }
    },
    resolve: async (
      _: undefined,
      { uuid, capabilities }: { uuid: string, capabilities: string[] }
    ) => {
      const applicant = await ApplicantRepository.findByUuid(uuid);
      await ApplicantRepository.deleteCapabilities(applicant, capabilities);
      return ApplicantSerializer.serialize(applicant);
    }
  },
  deleteApplicantCareers: {
    type: GraphQLApplicant,
    args: {
      uuid: {
        type: nonNull(ID)
      },
      careersCodes: {
        type: List(String)
      }
    },
    resolve: async (
      _: undefined,
      { uuid, careersCodes }: { uuid: string, careersCodes: string[] }
      ) => {
      const applicant = await ApplicantRepository.findByUuid(uuid);
      await ApplicantRepository.deleteCareers(applicant, careersCodes);
      return ApplicantSerializer.serialize(applicant);
    }
  },
  deleteSection: {
    type: GraphQLApplicant,
    args: {
      uuid: {
        type: nonNull(ID)
      },
      sectionUuid: {
        type: nonNull(ID)
      }
    },
    resolve: async (_: undefined, { uuid, sectionUuid }: { uuid: string, sectionUuid: string }) => {
      const applicant = await ApplicantRepository.deleteSection(uuid, sectionUuid);
      return ApplicantSerializer.serialize(applicant);
    }
  }
};

export default applicantMutations;
