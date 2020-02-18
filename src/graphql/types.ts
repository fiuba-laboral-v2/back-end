import { companyTypes } from "./Company";
import { ApplicantTypes } from "./Applicant";
import CareerTypes from "./Career/Types";

const types = [
  ...companyTypes,
  ...ApplicantTypes,
  ...CareerTypes
];

export default types;
