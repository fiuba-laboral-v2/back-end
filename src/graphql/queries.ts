import { merge } from "lodash";
import { translationQueries } from "./Translation";
import { companyQueries } from "./Company";
import { offerQueries } from "./Offer";
import { jobApplicationQueries } from "./JobApplication";
import { applicantQueries } from "./Applicant";
import { careerQueries } from "./Career";
import { userQueries } from "./User";
import { capabilityQueries } from "./Capability";
import { adminTaskQueries } from "$graphql/AdminTask";
import { adminQueries } from "./Admin";
import { adminSettingsQueries } from "./AdminSettings";
import { companyNotificationQueries } from "./CompanyNotification";
import { applicantNotificationQueries } from "./ApplicantNotification";
import { adminNotificationQueries } from "./AdminNotification";
import { companyUserQueries } from "./CompanyUser";

export const queries = () =>
  merge(
    translationQueries,
    companyQueries,
    offerQueries,
    jobApplicationQueries,
    applicantQueries,
    careerQueries,
    userQueries,
    capabilityQueries,
    adminTaskQueries,
    adminQueries,
    adminSettingsQueries,
    companyNotificationQueries,
    applicantNotificationQueries,
    adminNotificationQueries,
    companyUserQueries
  );
