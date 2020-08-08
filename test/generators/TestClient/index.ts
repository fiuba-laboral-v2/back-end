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
  user: async (attributes: IUserTestClientAttributes = {}) =>
    userTestClient(attributes),
  admin: async (attributes: IUserTestClientAttributes = {}) =>
    adminTestClient(attributes),
  applicant: async (attributes: IApplicantTestClientAttributes = {}) =>
    applicantTestClient(attributes),
  company: async (attributes: ICompanyTestClientAttributes = {}) =>
    companyTestClient(attributes)
};
