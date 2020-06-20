import { Company } from "../../src/models/Company";
import { IExpressContext } from "../graphql/ExpressContext";
import { client } from "../graphql/ApolloTestClient";
import { Applicant } from "../../src/models/Applicant";
import { Admin } from "../../src/models/Admin";
import { User } from "../../src/models/User";

export const apolloClientFactory = {
  login: {
    user: async (user: User, expressContext?: IExpressContext) => {
      const apolloClient = client.loggedIn({
        currentUser: {
          uuid: user.uuid,
          email: user.email
        },
        expressContext
      });
      return { apolloClient, user };
    },
    admin: async (admin: Admin, expressContext?: IExpressContext) => {
      const user = await admin.getUser();
      const apolloClient = client.loggedIn({
        currentUser: {
          uuid: user.uuid,
          email: user.email,
          admin: {
            userUuid: admin.userUuid
          }
        },
        expressContext
      });
      return { apolloClient, user, admin };
    },
    company: async (company: Company, expressContext?: IExpressContext) => {
      const [user] = await company.getUsers();
      const apolloClient = client.loggedIn({
        currentUser: {
          uuid: user.uuid,
          email: user.email,
          company: {
            uuid: company.uuid,
            approvalStatus: company.approvalStatus
          }
        },
        expressContext
      });
      return { apolloClient, user, company };
    },
    applicant: async (applicant: Applicant, expressContext?: IExpressContext) => {
      const user = await applicant.getUser();
      const apolloClient = client.loggedIn({
        currentUser: {
          uuid: user.uuid,
          email: user.email,
          applicant: {
            uuid: applicant.uuid
          }
        },
        expressContext
      });
      return { apolloClient, user, applicant };
    }
  }
};
