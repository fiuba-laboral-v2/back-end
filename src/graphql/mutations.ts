import { merge } from "lodash";
import { companyMutations } from "./Company";
import { applicantMutations } from "./Applicant";
import { careerMutations } from "./Career";

const mutations = () => merge(
  applicantMutations,
  careerMutations,
  companyMutations
);

export default mutations;
