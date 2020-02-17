import { companyProfileType } from "./CompanyProfile";
import { ApplicantTypes } from "./Applicant";
import CareerTypes from "./Career/Types";

const types = [
  companyProfileType,
  ...ApplicantTypes,
  ...CareerTypes
];

export default types;
