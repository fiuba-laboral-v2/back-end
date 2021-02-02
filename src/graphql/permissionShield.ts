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
import { adminSettingsPermissions } from "./AdminSettings";
import { companyNotificationPermissions } from "./CompanyNotification";
import { applicantNotificationPermissions } from "./ApplicantNotification";
import { adminNotificationPermissions } from "./AdminNotification";
import { companyUserPermissions } from "./CompanyUser";

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
  adminSettingsPermissions,
  companyNotificationPermissions,
  applicantNotificationPermissions,
  adminNotificationPermissions,
  companyUserPermissions
);

export const permissionShield = shield(permissions, {
  debug: Environment.NODE_ENV() !== Environment.PRODUCTION,
  allowExternalErrors: true
});
