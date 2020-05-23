import { List } from "../../fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository } from "../../../models/JobApplication";
import { ICompanyUser } from "../../../graphqlContext";

export const getJobApplicationsByCompany = {
  type: List(GraphQLJobApplication),
  resolve: (_: undefined, __: undefined, { currentUser }: { currentUser: ICompanyUser }) =>
    JobApplicationRepository.findByCompanyUuid(currentUser.companyUuid)
};
