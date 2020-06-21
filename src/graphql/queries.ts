import { merge } from "lodash";
import { translationQueries } from "./Translation";
import { companyQueries } from "./Company";
import { offerQueries } from "./Offer";
import { jobApplicationQueries } from "./JobApplication";
import { applicantQueries } from "./Applicant";
import { careerQueries } from "./Career";
import { userQueries } from "./User";
import { capabilityQueries } from "./Capability";
import { approvableQueries } from "./Approvable/Queries";

const queries = () => merge(
  translationQueries,
  companyQueries,
  offerQueries,
  jobApplicationQueries,
  applicantQueries,
  careerQueries,
  userQueries,
  capabilityQueries,
  approvableQueries
);

export default queries;
