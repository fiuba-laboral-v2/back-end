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
  index: 0,
  getIndex: () => {
    TestClientGenerator.index += 1;
    return TestClientGenerator.index;
  },
  user: async (attributes: IUserTestClientAttributes = {}) =>
    userTestClient(TestClientGenerator.getIndex(), attributes),
  admin: async (attributes: IUserTestClientAttributes = {}) =>
    adminTestClient(TestClientGenerator.getIndex(), attributes),
  applicant: async (attributes: IApplicantTestClientAttributes = {}) =>
    applicantTestClient(TestClientGenerator.getIndex(), attributes),
  company: async (attributes: ICompanyTestClientAttributes = {}) =>
    companyTestClient(TestClientGenerator.getIndex(), attributes)
};
