import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { UserRepository } from "$models/User";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { AdminNotFoundError } from "$models/Admin/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin } from "$models";
import { UUID } from "$models/UUID";

import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";

const GET_ADMIN_BY_UUID = gql`
  query getAdminByUuid($uuid: ID!) {
    getAdminByUuid(uuid: $uuid) {
      uuid
    }
  }
`;

describe("getAdminByUuid", () => {
  let extensionAdmin: Admin;
  let graduadosAdmin: Admin;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    extensionAdmin = await AdminGenerator.extension();
    graduadosAdmin = await AdminGenerator.graduados();
  });

  const performQuery = (apolloClient: TestClient, uuid: string) =>
    apolloClient.query({ query: GET_ADMIN_BY_UUID, variables: { uuid } });

  it("returns an extensionAdmin by uuid", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await performQuery(apolloClient, extensionAdmin.userUuid);
    expect(errors).toBeUndefined();
    expect(data!.getAdminByUuid.uuid).toEqual(extensionAdmin.userUuid);
  });

  it("returns a graduadosAdmin by uuid", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await performQuery(apolloClient, graduadosAdmin.userUuid);
    expect(errors).toBeUndefined();
    expect(data!.getAdminByUuid.uuid).toEqual(graduadosAdmin.userUuid);
  });

  it("returns an error if the uuid does not belong to a persisted admin", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(AdminNotFoundError.name);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.pending });
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from an approved company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.approved });
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.rejected });
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an approved applicant", async () => {
    const status = ApprovalStatus.approved;
    const { apolloClient } = await TestClientGenerator.applicant({ status });
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const status = ApprovalStatus.rejected;
    const { apolloClient } = await TestClientGenerator.applicant({ status });
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const status = ApprovalStatus.pending;
    const { apolloClient } = await TestClientGenerator.applicant({ status });
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
