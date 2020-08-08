import { applicantTestClient } from "./Applicant";
import { userTestClient } from "./User";
import { companyTestClient } from "./Company";
import { adminTestClient } from "./Admin";
import {
  IApplicantTestClientAttributes,
  ICompanyTestClientAttributes
} from "$generators/interfaces";
import { IUserTestClientAttributes } from "../interfaces";

export const TestClientGenerator = {
  user: (attributes: IUserTestClientAttributes = {}) =>
    userTestClient(attributes),
  admin: (attributes: IUserTestClientAttributes = {}) =>
    adminTestClient(attributes),
  applicant: (attributes: IApplicantTestClientAttributes = {}) =>
    applicantTestClient(attributes),
  company: (attributes: ICompanyTestClientAttributes = {}) =>
    companyTestClient(attributes)
};
