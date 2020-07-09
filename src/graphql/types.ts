import { adminTypes } from "./Admin";
import { companyTypes } from "./Company";
import { offerTypes } from "./Offer";
import { applicantTypes } from "./Applicant";
import { jobApplicationTypes } from "./JobApplication";
import CareerTypes from "./Career/Types";
import { userTypes } from "./User/Types";
import { capabilityTypes } from "./Capability";
import { translationTypes } from "./Translation/Types";
import { approvalStatusTypes } from "./ApprovalStatus";
import { approvableTypes } from "./AdminTask/Types";

const types = [
  ...adminTypes,
  ...companyTypes,
  ...offerTypes,
  ...applicantTypes,
  ...CareerTypes,
  ...userTypes,
  ...capabilityTypes,
  ...jobApplicationTypes,
  ...translationTypes,
  ...approvalStatusTypes,
  ...approvableTypes
];

export default types;
