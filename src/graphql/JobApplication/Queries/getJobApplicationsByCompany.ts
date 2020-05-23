import { List } from "../../fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository } from "../../../models/JobApplication";
import { ICompanyUser } from "../../../graphqlContext";
import { CompanyRepository } from "../../../models/Company";

export const getJobApplicationsByCompany = {
  type: List(GraphQLJobApplication),
  resolve: async (_: undefined, __: undefined, { currentUser }: { currentUser: ICompanyUser }) => {
    const company = await CompanyRepository.findByUuid(currentUser.companyUuid);
    return JobApplicationRepository.findByCompany(company);
  }
};
