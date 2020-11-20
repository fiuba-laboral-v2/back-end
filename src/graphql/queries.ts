import { merge } from "lodash";
import { translationQueries } from "./Translation";
import { companyQueries } from "./Company";
import { offerQueries } from "./Offer";
import { jobApplicationQueries } from "./JobApplication";
import { applicantQueries } from "./Applicant";
import { careerQueries } from "./Career";
import { userQueries } from "./User";
import { capabilityQueries } from "./Capability";
import { adminTaskQueries } from "./AdminTask/Queries";
import { adminQueries } from "./Admin";
import { secretarySettingsQueries } from "./SecretarySettings";
import { notificationQueries } from "./Notification";
import { companyNotificationQueries } from "./CompanyNotification";

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
    secretarySettingsQueries,
    notificationQueries,
    companyNotificationQueries
  );
