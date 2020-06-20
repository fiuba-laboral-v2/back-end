import { userFactory } from "./user";
import { apolloClientFactory } from "./apolloClientFactory";
import { IUserProps, IApplicantProps, ICompanyProps } from "./interfaces";

export const testClientFactory = {
  user: async ({ password, expressContext }: IUserProps = {}) => {
    const user = await userFactory.user({ password });
    return apolloClientFactory.login.user(user, expressContext);
  },
  admin: async ({ password, expressContext }: IUserProps = {}) => {
    const admin = await userFactory.admin({ password });
    return apolloClientFactory.login.admin(admin, expressContext);
  },
  applicant: async ({ expressContext, ...applicantAttributes }: IApplicantProps = {}) => {
    const applicant = await userFactory.applicant(applicantAttributes);
    return apolloClientFactory.login.applicant(applicant, expressContext);
  },
  company: async ({ photos, expressContext }: ICompanyProps = {}) => {
    const company = await userFactory.company({ photos });
    return apolloClientFactory.login.company(company, expressContext);
  }
};
