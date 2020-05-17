import { merge } from "lodash";
import { shield } from "graphql-shield";

import { Environment } from "../config/Environment";
import { jobApplicationPermissions } from "./JobApplication";
import { userPermissions } from "./User";
import { offerPermissions } from "./Offer";
import { applicantPermissions } from "./Applicant";

const permissions = merge(
  offerPermissions,
  jobApplicationPermissions,
  userPermissions,
  applicantPermissions
);

export const permissionShield = shield(
  permissions,
  { debug: Environment.NODE_ENV !== "production" }
);
