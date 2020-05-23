import { merge } from "lodash";
import { translationQueries } from "./Translation";
import { companyQueries } from "./Company";
import { offerQueries } from "./Offer";
import { jobApplicationMutationsQueries } from "./JobApplication";
import { applicantQueries } from "./Applicant";
import { careerQueries } from "./Career";
import { userQueries } from "./User";
import { capabilityQueries } from "./Capability";

const queries = () => merge(
  translationQueries,
  companyQueries,
  offerQueries,
  jobApplicationMutationsQueries,
  applicantQueries,
  careerQueries,
  userQueries,
  capabilityQueries
);

export default queries;
