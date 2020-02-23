import { merge } from "lodash";
import { translationQueries } from "./Translation";
import { companyQueries } from "./Company";
import { applicantQueries } from "./Applicant";
import { careerQueries } from "./Career";
import { userQueries } from "./User";

const queries = () => merge(
  translationQueries,
  companyQueries,
  applicantQueries,
  careerQueries,
  userQueries
);

export default queries;
