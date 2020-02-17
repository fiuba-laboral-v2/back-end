import { merge } from "lodash";
import { companyProfileMutations } from "./CompanyProfile";
import { applicantMutations } from "./Applicant";
// import { careerMutations } from "./Career";

const mutations = () => merge(
  companyProfileMutations,
  applicantMutations
  // careerMutations
);

export default mutations;
