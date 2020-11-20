import { merge } from "lodash";
import { shield } from "graphql-shield";

import { Environment } from "../config/Environment";
import { jobApplicationPermissions } from "./JobApplication";
import { offerPermissions } from "./Offer";
import { applicantPermissions } from "./Applicant";
import { capabilitiesPermissions } from "./Capability";
import { careersPermissions } from "./Career";
import { companyPermissions } from "./Company";
import { userPermissions } from "./User";
import { adminTaskPermissions } from "./AdminTask";
import { adminPermissions } from "./Admin";
import { secretarySettingsPermissions } from "./SecretarySettings";
import { notificationPermissions } from "./Notification";
import { companyNotificationPermissions } from "./CompanyNotification";

const permissions = merge(
  offerPermissions,
  jobApplicationPermissions,
  applicantPermissions,
  capabilitiesPermissions,
  careersPermissions,
  companyPermissions,
  userPermissions,
  adminTaskPermissions,
  adminPermissions,
  secretarySettingsPermissions,
  notificationPermissions,
  companyNotificationPermissions
);

export const permissionShield = shield(permissions, {
  debug: Environment.NODE_ENV !== Environment.PRODUCTION
});
