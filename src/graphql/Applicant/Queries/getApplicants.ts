import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { List } from "$graphql/fieldTypes";
import { ApplicantRepository } from "$models/Applicant";

const getApplicants = {
  type: List(GraphQLApplicant),
  resolve: () => ApplicantRepository.findAll()
};

export { getApplicants };
