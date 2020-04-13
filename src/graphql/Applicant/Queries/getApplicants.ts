import { GraphQLApplicant } from "../Types/Applicant";
import { List } from "../../fieldTypes";
import { ApplicantRepository } from "../../../models/Applicant";

const getApplicants = {
  type: List(GraphQLApplicant),
  resolve: () => ApplicantRepository.findAll()
};

export { getApplicants };
