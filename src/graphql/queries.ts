import { merge } from "lodash";
import { rootQueries } from "./Root";
import { translationQueries } from "./Translation";
import { companyProfileQueries } from "./CompanyProfile";

const queries = () => merge(
  rootQueries,
  translationQueries,
  companyProfileQueries
);

export default queries;
