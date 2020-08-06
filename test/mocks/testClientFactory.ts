import { userFactory } from "./user";
import { IApplicantAttributes, ICompanyAttributes, IUserProps } from "./interfaces";
import { User } from "$models";
import { CompanyRepository } from "$models/Company";
import { client } from "../graphql/ApolloTestClient";
import { IExpressContext } from "../graphql/ExpressContext";
import { ApplicantRepository } from "$models/Applicant";

const createApolloClient = (
  user: User,
  expressContext?: IExpressContext,
  entityContext?: object
) => client.loggedIn({
  currentUser: {
    uuid: user.uuid,
    email: user.email,
    ...entityContext
  },
  expressContext
});

export const testClientFactory = {
  user: async ({ password, expressContext }: IUserProps = {}) => {
    const user = await userFactory.user({ password });
    const apolloClient = createApolloClient(user, expressContext);
    return { apolloClient, user };
  },
  admin: async ({ password, expressContext }: IUserProps = {}) => {
    const admin = await userFactory.admin({ password });
    const user = await admin.getUser();
    const adminContext = { admin: { userUuid: admin.userUuid } };
    const apolloClient = createApolloClient(user, expressContext, adminContext);
    return { apolloClient, user, admin };
  },
  applicant: async (
    { status, expressContext, ...applicantAttributes }: IApplicantAttributes = {}
  ) => {
    let applicant = await userFactory.applicant(applicantAttributes);
    const user = await applicant.getUser();
    const applicantContext = { applicant: { uuid: applicant.uuid } };
    const apolloClient = createApolloClient(user, expressContext, applicantContext);
    if (status) {
      const { admin, approvalStatus } = status;
      applicant = await ApplicantRepository.updateApprovalStatus(
        admin.userUuid,
        applicant.uuid,
        approvalStatus
      );
    }
    return { apolloClient, user, applicant };
  },
  company: async ({ status, photos, expressContext }: ICompanyAttributes = {}) => {
    let company = await userFactory.company({ photos });
    const [user] = await company.getUsers();
    const companyContext = { company: { uuid: company.uuid } };
    const apolloClient = createApolloClient(user, expressContext, companyContext);
    if (status) {
      const { admin, approvalStatus } = status;
      company = await CompanyRepository.updateApprovalStatus(
        admin.userUuid,
        company.uuid,
        approvalStatus
      );
    }
    return { apolloClient, user, company };
  }
};
