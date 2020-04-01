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
import { GraphQLLinkInput } from "./Types/Link";

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
      },
      links: {
        type: List(GraphQLLinkInput)
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
      padron: {
        type: nonNull(Int)
      },
      capabilities: {
        type: List(String)
      }
    },
    resolve: async (_: undefined, props: { padron: number, capabilities: string[] }) => {
      const applicant = await ApplicantRepository.findByPadron(props.padron);
      await ApplicantRepository.deleteCapabilities(applicant, props.capabilities);
      return ApplicantSerializer.serialize(applicant);
    }
  },
  deleteApplicantCareers: {
    type: GraphQLApplicant,
    args: {
      padron: {
        type: nonNull(Int)
      },
      careersCodes: {
        type: List(String)
      }
    },
    resolve: async (_: undefined, props: { padron: number, careersCodes: string[] }) => {
      const applicant = await ApplicantRepository.findByPadron(props.padron);
      await ApplicantRepository.deleteCareers(applicant, props.careersCodes);
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
