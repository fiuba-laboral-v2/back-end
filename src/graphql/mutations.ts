import { merge } from "lodash";
import { rootMutations } from "./Root";

const mutations = () => merge(
  rootMutations
);

export default mutations;
