import { merge } from "lodash";
import { companyMutations } from "./Company";
import { offerMutations } from "./Offer";
import { applicantMutations } from "./Applicant";
import { emailMutations } from "./Email";
import { jobApplicationMutations } from "./JobApplication";
import { careerMutations } from "./Career";
import { userMutations } from "./User";

const mutations = () =>
  merge(
    applicantMutations,
    careerMutations,
    companyMutations,
    userMutations,
    offerMutations,
    emailMutations,
    jobApplicationMutations
  );

export default mutations;
