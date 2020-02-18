import { merge } from "lodash";
import { translationQueries } from "./Translation";
import { companyProfileQueries } from "./CompanyProfile";
import { applicantQueries } from "./Applicant";
import { careerQueries } from "./Career";

const queries = () => merge(
  translationQueries,
  companyProfileQueries,
  applicantQueries,
  careerQueries
);

export default queries;
