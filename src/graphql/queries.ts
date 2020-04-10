import { merge } from "lodash";
import { translationQueries } from "./Translation";
import { companyQueries } from "./Company";
import { offerQueries } from "./Offer";
import { applicantQueries } from "./Applicant";
import { careerQueries } from "./Career";
import { userQueries } from "./User";

const queries = () => merge(
  translationQueries,
  companyQueries,
  offerQueries,
  applicantQueries,
  careerQueries,
  userQueries
);

export default queries;
