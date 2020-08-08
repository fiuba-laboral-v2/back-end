import { applicantTestClient } from "./Applicant";
import { userTestClient } from "./User";
import { companyTestClient } from "./Company";
import { adminTestClient } from "./Admin";
import { IApplicantAttributes, ICompanyAttributes } from "$generators/interfaces";
import { IUserProps } from "../interfaces";

export const TestClientGenerator = {
  index: 0,
  getIndex: () => {
    TestClientGenerator.index += 1;
    return TestClientGenerator.index;
  },
  user: async (attributes: IUserProps = {}) =>
    userTestClient(TestClientGenerator.getIndex(), attributes),
  admin: async (attributes: IUserProps = {}) =>
    adminTestClient(TestClientGenerator.getIndex(), attributes),
  applicant: async (attributes: IApplicantAttributes = {}) =>
    applicantTestClient(TestClientGenerator.getIndex(), attributes),
  company: async (attributes: ICompanyAttributes = {}) =>
    companyTestClient(TestClientGenerator.getIndex(), attributes)
};
