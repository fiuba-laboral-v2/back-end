import { companyTypes } from "./Company";
import { offerTypes } from "./Offer";
import { ApplicantTypes } from "./Applicant";
import CareerTypes from "./Career/Types";
import { userTypes } from "./User/Types";
import { capabilityTypes } from "./Capability";

const types = [
  ...companyTypes,
  ...offerTypes,
  ...ApplicantTypes,
  ...CareerTypes,
  ...userTypes,
  ...capabilityTypes
];

export default types;
