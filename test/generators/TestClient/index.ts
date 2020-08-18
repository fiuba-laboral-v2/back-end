import { applicantTestClient } from "./Applicant";
import { userTestClient } from "./User";
import { companyTestClient } from "./Company";
import { adminTestClient } from "./Admin";
import {
  IApplicantTestClientAttributes,
  ICompanyTestClientAttributes,
  IAdminTestClientAttributes
} from "$generators/interfaces";
import { IUserTestClientAttributes } from "../interfaces";
import { Secretary } from "$models/Admin";

export const TestClientGenerator = {
  user: (attributes: IUserTestClientAttributes = {}) => userTestClient(attributes),
  admin: (attributes: IAdminTestClientAttributes = { secretary: Secretary.graduados }) =>
    adminTestClient(attributes),
  applicant: (attributes: IApplicantTestClientAttributes = {}) => applicantTestClient(attributes),
  company: (attributes: ICompanyTestClientAttributes = {}) => companyTestClient(attributes)
};
