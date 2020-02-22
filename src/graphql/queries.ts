import { merge } from "lodash";
import { translationQueries } from "./Translation";
import { companyQueries } from "./Company";
import { userQueries } from "./User";

const queries = () => merge(
  translationQueries,
  companyQueries,
  userQueries
);

export default queries;
