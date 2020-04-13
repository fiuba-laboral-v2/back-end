import { ID, List, nonNull, String } from "../../fieldTypes";
import { GraphQLApplicant } from "../Types/Applicant";

import { ApplicantRepository } from "../../../models/Applicant";

const deleteApplicantCareers = {
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
    return applicant;
  }
};

export { deleteApplicantCareers };
