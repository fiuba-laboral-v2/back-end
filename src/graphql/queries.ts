import { merge } from "lodash";
import { translationQueries } from "./Translation";
import { companyProfileQueries } from "./Company";

const queries = () => merge(
  translationQueries,
  companyProfileQueries
);

export default queries;
