import { merge } from "lodash";
import { companyMutations } from "./Company";

const mutations = () => merge(
  companyMutations
);

export default mutations;
