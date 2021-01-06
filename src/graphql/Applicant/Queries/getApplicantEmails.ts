import { String, List } from "$graphql/fieldTypes";
import { GraphQLApplicantType } from "$graphql/Applicant/Types/GraphQLApplicantType";
import { ApplicantRepository, IFindLatest } from "$models/Applicant";
import { UserRepository } from "$models/User";

export const getApplicantEmails = {
  type: List(String),
  args: {
    name: {
      type: String
    },
    careerCodes: {
      type: List(String)
    },
    applicantType: {
      type: GraphQLApplicantType
    }
  },
  resolve: async (_: undefined, filter: IFindLatest) => {
    const { results } = await ApplicantRepository.findLatest(filter);
    const users = await Promise.all(
      results.map(applicant => UserRepository.findByUuid(applicant.userUuid))
    );
    return users.map(user => user.email);
  }
};
