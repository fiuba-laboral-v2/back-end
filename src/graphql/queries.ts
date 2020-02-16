import { merge } from "lodash";
import { translationQueries } from "./Translation";
import { companyQueries } from "./Company";

const queries = () => merge(
  translationQueries,
  companyQueries
);

export default queries;
