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
  let adminExtension: Admin;
  let adminGraduados: Admin;
  let apolloClientAdminExtension;
  let apolloClientAdminGraduados;

  beforeAll(async () => {
    await ApplicantRepository.truncate();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await AdminRepository.truncate();
    ({
      admin: adminGraduados,
      apolloClient: apolloClientAdminGraduados
    } = await TestClientGenerator.admin({
      secretary: Secretary.graduados
    }));
    ({
      admin: adminExtension,
      apolloClient: apolloClientAdminExtension
    } = await TestClientGenerator.admin({
      secretary: Secretary.extension
    }));
  });

  describe("successful cases", () => {
    let adminExtraExtension: Admin;
    let adminExtraGraduados: Admin;
    let allSortedAdmins;

    beforeAll(async () => {
      adminExtraExtension = await AdminGenerator.extension();
      adminExtraGraduados = await AdminGenerator.graduados();
      allSortedAdmins = await Promise.all(
        [adminExtraGraduados, adminExtraExtension, adminExtension, adminGraduados].map(
          async admin => {
            const user = await admin.getUser();
            return {
              user: {
                uuid: user.uuid,
                email: user.email,
                name: user.name,
                surname: user.surname
              },
              updatedAt: admin.updatedAt.toISOString(),
              secretary: admin.secretary
            };
          }
        )
      );
    });

    it("fetches all admins for an admin from graduados", async () => {
      const { data, errors } = await apolloClientAdminGraduados.query({ query: GET_ADMINS });

      expect(errors).toBeUndefined();
      expect(data!.getAdmins.shouldFetchMore).toEqual(false);
      expect(data!.getAdmins.results).toEqual(allSortedAdmins);
    });

    it("fetches all admins for an admin from extension", async () => {
      const { data, errors } = await apolloClientAdminExtension.query({ query: GET_ADMINS });

      expect(errors).toBeUndefined();
      expect(data!.getAdmins.shouldFetchMore).toEqual(false);
      expect(data!.getAdmins.results).toEqual(allSortedAdmins);
    });

    it("supports pagination", async () => {
      const itemsPerPage = 2;
      mockItemsPerPage(itemsPerPage);
      const { data, errors } = await apolloClientAdminExtension.query({ query: GET_ADMINS });
      expect(errors).toBeUndefined();
      expect(data!.getAdmins.shouldFetchMore).toBe(true);
      expect(data!.getAdmins.results).toHaveLength(2);
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
        status: { admin: adminExtension, approvalStatus: ApprovalStatus.approved }
      });
      const { errors } = await apolloClient.query({ query: GET_ADMINS });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if current user is from company", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: { admin: adminExtension, approvalStatus: ApprovalStatus.approved }
      });
      const { errors } = await apolloClient.query({ query: GET_ADMINS });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});
