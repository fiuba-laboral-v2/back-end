import { companyTypes } from "./Company";
import { offerTypes } from "./Offer";
import { applicantTypes } from "./Applicant";
import { jobApplicationTypes } from "./JobApplication";
import CareerTypes from "./Career/Types";
import { userTypes } from "./User/Types";
import { capabilityTypes } from "./Capability";

const types = [
  ...companyTypes,
  ...offerTypes,
  ...applicantTypes,
  ...CareerTypes,
  ...userTypes,
  ...capabilityTypes,
  ...jobApplicationTypes
];

export default types;
