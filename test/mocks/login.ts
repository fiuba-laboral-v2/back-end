import { client } from "../graphql/ApolloTestClient";
import { userFactory } from "./user";

export const loginFactory = {
  user: async () => {
    const user = await userFactory.user();
    const apolloClient = client.loggedIn({
      uuid: user.uuid,
      email: user.email
    });

    return { user, apolloClient };
  },
  applicant: async () => {
    const applicant = await userFactory.applicant();
    const user = await applicant.getUser();
    const apolloClient = client.loggedIn({
      uuid: user.uuid,
      email: user.email,
      applicantUuid: applicant.uuid
    });

    return { user, applicant, apolloClient };
  },
  company: async () => {
    const company = await userFactory.company();
    const [user] = await company.getUsers();
    const apolloClient = client.loggedIn({
      uuid: user.uuid,
      email: user.email,
      companyUuid: company.uuid
    });

    return { user, company, apolloClient };
  }
};
