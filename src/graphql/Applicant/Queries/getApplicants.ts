import { GraphQLApplicant } from "../Types/Applicant";
import { List } from "../../fieldTypes";
import { ApplicantRepository, ApplicantSerializer } from "../../../models/Applicant";

const getApplicants = {
  type: List(GraphQLApplicant),
  resolve: async () => {
    const applicants = await ApplicantRepository.findAll();
    return applicants.map(applicant => ApplicantSerializer.serialize(applicant));
  }
};

export { getApplicants };
