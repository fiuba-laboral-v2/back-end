import { companyTypes } from "./Company";
import { ApplicantTypes } from "./Applicant";
import CareerTypes from "./Career/Types";
import { userTypes } from "./User/Types";

const types = [
  ...companyTypes,
  ...ApplicantTypes,
  ...CareerTypes,
  ...userTypes
];

export default types;
