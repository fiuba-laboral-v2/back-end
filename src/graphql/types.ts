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
import { notificationTypes } from "./Notification";

const types = [
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
  ...notificationTypes
];

export default types;
