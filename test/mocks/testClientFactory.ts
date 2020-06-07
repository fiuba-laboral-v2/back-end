import { client } from "../graphql/ApolloTestClient";
import { userFactory } from "./user";
import { IUserProps, IApplicantProps, ICompanyProps } from "./interfaces";

const createUser = async ({ password, isAdmin, expressContext }: IUserProps = {}) => {
  const user = await userFactory.user({ password, isAdmin });
  const apolloClient = client.loggedIn({
    currentUser: {
      uuid: user.uuid,
      email: user.email
    },
    expressContext
  });

  return { user, apolloClient };
};

export const testClientFactory = {
  user: async ({ password, expressContext }: IUserProps = {}) =>
    createUser({ password, expressContext }),
  admin: async ({ password, expressContext }: IUserProps = {}) =>
    createUser({ password, isAdmin: true, expressContext }),
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
  company: async ({ photos, expressContext }: ICompanyProps = {}) => {
    const company = await userFactory.company({ photos });
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
