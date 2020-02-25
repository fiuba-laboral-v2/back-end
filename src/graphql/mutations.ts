import { merge } from "lodash";
import { companyMutations } from "./Company";
import { applicantMutations } from "./Applicant";
import { careerMutations } from "./Career";
import { userMutations } from "./User";

const mutations = () => merge(
  applicantMutations,
  careerMutations,
  companyMutations,
  userMutations
);

export default mutations;
