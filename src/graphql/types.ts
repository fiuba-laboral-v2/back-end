import { companyTypes } from "./Company";
import { offerTypes } from "./Offer";
import { ApplicantTypes } from "./Applicant";
import CareerTypes from "./Career/Types";
import { userTypes } from "./User/Types";

const types = [
  ...companyTypes,
  ...offerTypes,
  ...ApplicantTypes,
  ...CareerTypes,
  ...userTypes
];

export default types;
