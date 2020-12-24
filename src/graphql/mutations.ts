import { merge } from "lodash";
import { companyMutations } from "./Company";
import { offerMutations } from "./Offer";
import { applicantMutations } from "./Applicant";
import { emailMutations } from "./Email";
import { jobApplicationMutations } from "./JobApplication";
import { careerMutations } from "./Career";
import { userMutations } from "./User";
import { adminSettingsMutations } from "./AdminSettings";
import { adminMutations } from "./Admin";
import { companyUserMutations } from "./CompanyUser";

export const mutations = () =>
  merge(
    applicantMutations,
    careerMutations,
    companyMutations,
    userMutations,
    offerMutations,
    emailMutations,
    jobApplicationMutations,
    adminSettingsMutations,
    adminMutations,
    companyUserMutations
  );
