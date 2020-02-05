import { merge } from "lodash";
import { companyProfileMutations } from "./CompanyProfile";
import { applicantMutations } from "./Applicant";
import { careerMutations } from "./Career";

const mutations = () => merge(
  applicantMutations,
  careerMutations,
  companyProfileMutations
);

export default mutations;
