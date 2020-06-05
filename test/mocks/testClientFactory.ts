import { client } from "../graphql/ApolloTestClient";
import { userFactory } from "./user";
import { IApplicantProps } from "./interfaces";

export const testClientFactory = {
  user: async () => {
    const user = await userFactory.user();
    const apolloClient = client.loggedIn({
      currentUser: {
        uuid: user.uuid,
        email: user.email
      }
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
  company: async () => {
    const company = await userFactory.company();
    const [user] = await company.getUsers();
    const apolloClient = client.loggedIn({
      currentUser: {
        uuid: user.uuid,
        email: user.email,
        companyUuid: company.uuid
      }
    });

    return { user, company, apolloClient };
  }
};
