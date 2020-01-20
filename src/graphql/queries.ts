import { merge } from "lodash";
import { studentQueries } from "./Student";
import { rootQueries } from "./Root";
import { adminQueries } from "./Admin";

const queries = () => merge(
  studentQueries,
  rootQueries,
  adminQueries
);

export default queries;
