import { merge } from "lodash";
import { companyProfileMutations } from "./Company";

const mutations = () => merge(
  companyProfileMutations
);

export default mutations;
