import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { UserRepository } from "$models/User";
import { AdminRepository, DeleteLastCompanyUserError } from "$models/Admin";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { AdminNotFoundError } from "$models/Admin/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UUID } from "$models/UUID";

import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";

const DEACTIVATE_ADMIN_ACCOUNT = gql`
  mutation DeactivateAdminAccount($uuid: ID!) {
    deactivateAdminAccount(uuid: $uuid) {
      uuid
      user {
        email
        name
        surname
      }
      secretary
    }
  }
`;

describe("deactivateAdminAccount", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const performMutation = (apolloClient: TestClient, uuid: string) =>
    apolloClient.mutate({ mutation: DEACTIVATE_ADMIN_ACCOUNT, variables: { uuid } });

  it("deletes an extension admin", async () => {
    const extensionAdmin = await AdminGenerator.extension();
    const { apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await performMutation(apolloClient, extensionAdmin.userUuid);
    expect(errors).toBeUndefined();
    expect(data!.deactivateAdminAccount.uuid).toEqual(extensionAdmin.userUuid);
    await expect(
      AdminRepository.findByUserUuid(extensionAdmin.userUuid)
    ).rejects.toThrowErrorWithMessage(
      AdminNotFoundError,
      AdminNotFoundError.buildMessage(extensionAdmin.userUuid)
    );
  });

  it("deletes a graduados admin", async () => {
    const graduadosAdmin = await AdminGenerator.graduados();
    const { apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await performMutation(apolloClient, graduadosAdmin.userUuid);
    expect(errors).toBeUndefined();
    expect(data!.deactivateAdminAccount.uuid).toEqual(graduadosAdmin.userUuid);
    await expect(
      AdminRepository.findByUserUuid(graduadosAdmin.userUuid)
    ).rejects.toThrowErrorWithMessage(
      AdminNotFoundError,
      AdminNotFoundError.buildMessage(graduadosAdmin.userUuid)
    );
  });

  it("returns an error if its the last admin", async () => {
    await AdminRepository.truncate();
    const { apolloClient, admin } = await TestClientGenerator.admin();
    const { errors } = await performMutation(apolloClient, admin.userUuid);
    expect(errors).toEqualGraphQLErrorType(DeleteLastCompanyUserError.name);
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
