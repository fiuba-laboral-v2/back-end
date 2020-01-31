import { merge } from "lodash";
import { rootMutations } from "./Root";
import { companyProfileMutations } from "./CompanyProfile";

const mutations = () => merge(
  rootMutations,
  companyProfileMutations
);

export default mutations;
