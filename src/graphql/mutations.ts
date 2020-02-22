import { merge } from "lodash";
import { companyMutations } from "./Company";
import { userMutations } from "./User";

const mutations = () => merge(
  companyMutations,
  userMutations
);

export default mutations;
