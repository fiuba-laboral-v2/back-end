import { merge } from "lodash";
import { shield } from "graphql-shield";
import { jobApplicationPermissions } from "./JobApplication";
import { userPermissions } from "./User";
import { offerPermissions } from "./Offer/permissions";
import { Environment } from "../config/Environment";

const permissions = merge(
  offerPermissions,
  jobApplicationPermissions,
  userPermissions
);

export const permissionShield = shield(
  permissions,
  { debug: Environment.NODE_ENV !== "production" }
);
