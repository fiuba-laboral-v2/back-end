import { merge } from "lodash";
import { shield } from "graphql-shield";
import { jobApplicationPermissions } from "./JobApplication";
import { userPermissions } from "./User";
import { offerPermissions } from "./Offer/permissions";

const permissions = merge(
  offerPermissions,
  jobApplicationPermissions,
  userPermissions
);

export default shield(permissions, { debug: process.env.NODE_ENV !== "production" });
