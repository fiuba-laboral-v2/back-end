import { merge } from "lodash";
import { rootQueries } from "./Root";
import { translationQueries } from "./Translation";

const queries = () => merge(
  rootQueries,
  translationQueries
);

export default queries;
