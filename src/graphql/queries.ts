import { merge } from "lodash";
import { translationQueries } from "./Translation";
import { companyQueries } from "./Company";
import { offerQueries } from "./Offer";
import { applicantQueries } from "./Applicant";
import { careerQueries } from "./Career";
import { userQueries } from "./User";
import { capabilityQueries } from "./Capability/Queries";

const queries = () => merge(
  translationQueries,
  companyQueries,
  offerQueries,
  applicantQueries,
  careerQueries,
  userQueries,
  capabilityQueries
);

export default queries;
