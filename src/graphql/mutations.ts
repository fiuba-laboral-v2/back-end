import { merge } from "lodash";
import { companyProfileMutations } from "./CompanyProfile";

const mutations = () => merge(
  companyProfileMutations
);

export default mutations;
