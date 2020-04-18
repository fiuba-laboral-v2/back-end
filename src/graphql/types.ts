import { companyTypes } from "./Company";
import { offerTypes } from "./Offer";
import { ApplicantTypes } from "./Applicant";
import { jobApplicationTypes } from "./JobApplication";
import CareerTypes from "./Career/Types";
import { userTypes } from "./User/Types";
import { capabilityTypes } from "./Capability";
import translationTypes from "./Translation/Types";

const types = [
  ...companyTypes,
  ...offerTypes,
  ...ApplicantTypes,
  ...CareerTypes,
  ...userTypes,
  ...capabilityTypes,
  ...jobApplicationTypes,
  ...translationTypes
];

export default types;
