import { merge } from "lodash";
import { shield } from "graphql-shield";

import { Environment } from "../config/Environment";
import { jobApplicationPermissions } from "./JobApplication";
import { offerPermissions } from "./Offer";
import { applicantPermissions } from "./Applicant";
import { capabilitiesPermissions } from "./Capability";
import { careersPermissions } from "./Career";
import { companyPermissions } from "./Company";

const permissions = merge(
  offerPermissions,
  jobApplicationPermissions,
  applicantPermissions,
  capabilitiesPermissions,
  careersPermissions,
  companyPermissions
);

export const permissionShield = shield(
  permissions,
  { debug: Environment.NODE_ENV !== "production" }
);
