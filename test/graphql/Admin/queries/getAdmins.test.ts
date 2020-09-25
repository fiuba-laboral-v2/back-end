import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { ApprovalStatus } from "$models/ApprovalStatus";

import { TestClientGenerator } from "$generators/TestClient";
import { AdminGenerator } from "$generators/Admin";
import { AdminRepository, Secretary } from "$models/Admin";
import { Admin } from "$models";
import { mockItemsPerPage } from "$test/mocks/config/PaginationConfig";
import { ApplicantRepository } from "$src/models/Applicant";

const GET_ADMINS = gql`
  query getAdmins($updatedBeforeThan: PaginatedInput) {
    getAdmins(updatedBeforeThan: $updatedBeforeThan) {
      shouldFetchMore
      results {
        user {
          uuid
          email
          name
          surname
        }
        updatedAt
        secretary
      }
    }
  }
`;

describe("getAdmins", () => {
  let admin1: Admin;

  beforeAll(async () => {
    await ApplicantRepository.truncate();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await AdminRepository.truncate();
    admin1 = await AdminGenerator.instance({ secretary: Secretary.extension });
  });

  describe("successful cases", () => {
    it("fetches all admins for an admin from graduados", async () => {
      const { user, admin, apolloClient } = await TestClientGenerator.admin({
        secretary: Secretary.graduados
      });

      const { data, errors } = await apolloClient.query({ query: GET_ADMINS });

      const user1 = await admin1.getUser();
      expect(errors).toBeUndefined();
      expect(data!.getAdmins.shouldFetchMore).toEqual(false);
      expect(data!.getAdmins.results).toEqual(
        expect.arrayContaining([
          {
            user: {
              uuid: user.uuid,
              email: user.email,
              name: user.name,
              surname: user.surname
            },
            updatedAt: admin.updatedAt.toISOString(),
            secretary: admin.secretary
          },
          {
            user: {
              uuid: user1.uuid,
              email: user1.email,
              name: user1.name,
              surname: user1.surname
            },
            updatedAt: admin1.updatedAt.toISOString(),
            secretary: admin1.secretary
          }
        ])
      );
    });

    it("fetches all admins for an admin from extension", async () => {
      const { apolloClient } = await TestClientGenerator.admin({
        secretary: Secretary.extension
      });

      const { data, errors } = await apolloClient.query({ query: GET_ADMINS });

      expect(errors).toBeUndefined();
      expect(data!.getAdmins.shouldFetchMore).toEqual(false);
      expect(data!.getAdmins.results.length).toBeGreaterThanOrEqual(2);
    });

    it("supports pagination", async () => {
      const itemsPerPage = 2;
      mockItemsPerPage(itemsPerPage);
      const { apolloClient } = await TestClientGenerator.admin({
        secretary: Secretary.extension
      });
      const { data, errors } = await apolloClient.query({ query: GET_ADMINS });
      expect(errors).toBeUndefined();
      expect(data!.getAdmins.shouldFetchMore).toBe(true);
      expect(data!.getAdmins.results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();

      const { errors } = await apolloClient.query({ query: GET_ADMINS });
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("returns an error if current user is an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: { admin: admin1, approvalStatus: ApprovalStatus.approved }
      });
      const { errors } = await apolloClient.query({ query: GET_ADMINS });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if current user is from company", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: { admin: admin1, approvalStatus: ApprovalStatus.approved }
      });
      const { errors } = await apolloClient.query({ query: GET_ADMINS });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});
