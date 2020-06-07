import { client } from "../graphql/ApolloTestClient";
import { userFactory } from "./user";
import { IUserProps, IApplicantProps, IClientFactory } from "./interfaces";

export const testClientFactory = {
  user: async ({ password, expressContext }: IUserProps = {}) => {
    const user = await userFactory.user({ password });
    const apolloClient = client.loggedIn({
      currentUser: {
        uuid: user.uuid,
        email: user.email
      },
      expressContext
    });

    return { user, apolloClient };
  },
  admin: async ({ password, expressContext }: IUserProps = {}) => {
    const user = await userFactory.user({ password, isAdmin: true });
    const apolloClient = client.loggedIn({
      currentUser: {
        uuid: user.uuid,
        email: user.email
      },
      expressContext
    });

    return { user, apolloClient };
  },
  applicant: async (
    {
      careers,
      password,
      capabilities,
      expressContext
    }: IApplicantProps = {}
  ) => {
    const applicant = await userFactory.applicant({
      capabilities,
      careers,
      password
    });
    const user = await applicant.getUser();
    const apolloClient = client.loggedIn({
      currentUser: {
        uuid: user.uuid,
        email: user.email,
        applicantUuid: applicant.uuid
      },
      expressContext
    });

    return { user, applicant, apolloClient };
  },
  company: async ({ expressContext }: IClientFactory = {}) => {
    const company = await userFactory.company();
    const [user] = await company.getUsers();
    const apolloClient = client.loggedIn({
      currentUser: {
        uuid: user.uuid,
        email: user.email,
        companyUuid: company.uuid
      },
      expressContext
    });

    return { user, company, apolloClient };
  }
};
