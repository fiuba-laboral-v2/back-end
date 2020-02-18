import { merge } from "lodash";
import { translationQueries } from "./Translation";
import { companyQueries } from "./Company";
import { applicantQueries } from "./Applicant";
import { careerQueries } from "./Career";

const queries = () => merge(
  translationQueries,
  companyQueries,
  applicantQueries,
  careerQueries
);

export default queries;
