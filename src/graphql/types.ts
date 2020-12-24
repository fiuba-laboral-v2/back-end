import { adminTypes } from "./Admin";
import { companyTypes } from "./Company";
import { offerTypes } from "./Offer";
import { applicantTypes } from "./Applicant";
import { jobApplicationTypes } from "./JobApplication";
import { careerTypes } from "./Career/Types";
import { userTypes } from "./User/Types";
import { capabilityTypes } from "./Capability";
import { translationTypes } from "./Translation";
import { approvalStatusTypes } from "./ApprovalStatus";
import { adminTaskTypes } from "./AdminTask/Types";
import { adminSettingsTypes } from "./AdminSettings/Types";
import { companyNotificationTypes } from "./CompanyNotification";
import { applicantNotificationTypes } from "./ApplicantNotification";
import { adminNotificationTypes } from "./AdminNotification";
import { companyUserTypes } from "./CompanyUser";

export const types = [
  ...adminTypes,
  ...companyTypes,
  ...offerTypes,
  ...applicantTypes,
  ...careerTypes,
  ...userTypes,
  ...capabilityTypes,
  ...jobApplicationTypes,
  ...translationTypes,
  ...approvalStatusTypes,
  ...adminTaskTypes,
  ...adminSettingsTypes,
  ...companyNotificationTypes,
  ...applicantNotificationTypes,
  ...adminNotificationTypes,
  ...companyUserTypes
];
