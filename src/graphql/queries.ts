import { merge } from "lodash";
import { applicantQueries } from "./Applicant";
import { careerQueries } from "./Career";
import { companyProfileQueries } from "./CompanyProfile";
import { translationQueries } from "./Translation";

const queries = () => merge(
  applicantQueries,
  careerQueries,
  companyProfileQueries,
  translationQueries
);

export default queries;
