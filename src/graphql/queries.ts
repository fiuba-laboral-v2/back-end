import { merge } from "lodash";
import { studentQueries } from "./Student";
import { rootQueries } from "./Root";
import { adminQueries } from "./Admin";
import { translationQueries } from "./Translation";

const queries = () => merge(
  studentQueries,
  rootQueries,
  adminQueries,
  translationQueries
);

export default queries;
