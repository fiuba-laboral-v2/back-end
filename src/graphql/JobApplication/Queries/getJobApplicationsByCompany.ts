import { List } from "../../fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository } from "../../../models/JobApplication";
import { ICompanyUser } from "../../../graphqlContext";

export const getJobApplicationsByCompany = {
  type: List(GraphQLJobApplication),
  resolve: async (_: undefined, __: undefined, { currentUser }: { currentUser: ICompanyUser }) => {
    const jobApplications = await JobApplicationRepository.findByCompanyUuid(
      currentUser.companyUuid
    );
    return Promise.all(jobApplications.map(jobApplication =>
      ({ offer: jobApplication.getOffer(), applicant: jobApplication.getApplicant() })
    ));
  }
};
