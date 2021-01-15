import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { UserRepository } from "$models/User";
import { AdminRepository, AdminStatus } from "$models/Admin";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { AdminNotFoundError } from "$models/Admin/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UUID } from "$models/UUID";

import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";

const ACTIVATE_ADMIN_ACCOUNT = gql`
  mutation ActivateAdminAccount($uuid: ID!) {
    activateAdminAccount(uuid: $uuid) {
      uuid
      status
      user {
        email
        name
        surname
      }
      secretary
    }
  }
`;

describe("activateAdminAccount", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const performMutation = (apolloClient: TestClient, uuid: string) =>
    apolloClient.mutate({ mutation: ACTIVATE_ADMIN_ACCOUNT, variables: { uuid } });

  it("activates an admin account if it was deleted", async () => {
    const extensionAdmin = await AdminGenerator.extension();
    await AdminRepository.delete(extensionAdmin);
    const { apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await performMutation(apolloClient, extensionAdmin.userUuid);
    expect(errors).toBeUndefined();
    const activatedAdmin = await AdminRepository.findByUserUuid(extensionAdmin.userUuid);
    expect(data!.activateAdminAccount.uuid).toEqual(activatedAdmin.userUuid);
    expect(data!.activateAdminAccount.status).toEqual(AdminStatus.active);
    expect(activatedAdmin.getStatus()).toEqual(AdminStatus.active);
  });

  it("returns an error if the admin was no deleted", async () => {
    const graduadosAdmin = await AdminGenerator.graduados();
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await performMutation(apolloClient, graduadosAdmin.userUuid);
    expect(errors).toEqualGraphQLErrorType(AdminNotFoundError.name);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performMutation(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.pending });
    const { errors } = await performMutation(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from an approved company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.approved });
    const { errors } = await performMutation(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.rejected });
    const { errors } = await performMutation(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an approved applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved
    });
    const { errors } = await performMutation(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.rejected
    });
    const { errors } = await performMutation(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.pending
    });
    const { errors } = await performMutation(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
