import { merge } from "lodash";
import { shield } from "graphql-shield";
import { jobApplicationPermissions } from "./JobApplication";
import { userPermissions } from "./User";

const permissions = merge(
  jobApplicationPermissions,
  userPermissions
);

export default shield(permissions);
