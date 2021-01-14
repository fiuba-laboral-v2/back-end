import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { IUpdateAdmin } from "$graphql/Admin/Mutations/updateAdmin";
import { User, UserRepository } from "$models/User";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AdminRepository, Secretary } from "$models/Admin";
import { Admin } from "$models";

import { EmailGenerator } from "$generators/Email";
import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";
import { set } from "lodash";

const UPDATE_ADMIN = gql`
  mutation updateAdmin($uuid: ID!, $user: UserUpdateInput!, $secretary: Secretary!) {
    updateAdmin(uuid: $uuid, user: $user, secretary: $secretary) {
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

describe("updateAdmin", () => {
  let extensionAdmin: Admin;
  let extensionAdminUser: User;
  let graduadosAdmin: Admin;
  let graduadosAdminUser: User;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    extensionAdmin = await AdminGenerator.extension();
    extensionAdminUser = await UserRepository.findByUuid(extensionAdmin.userUuid);
    graduadosAdmin = await AdminGenerator.graduados();
    graduadosAdminUser = await UserRepository.findByUuid(graduadosAdmin.userUuid);
  });

  const defaultExtensionAdminVariables = (): IUpdateAdmin => ({
    uuid: extensionAdmin.userUuid,
    user: {
      email: extensionAdminUser.email,
      name: extensionAdminUser.name,
      surname: extensionAdminUser.surname
    },
    secretary: extensionAdmin.secretary
  });

  const performQuery = (apolloClient: TestClient, variables: IUpdateAdmin) =>
    apolloClient.query({ query: UPDATE_ADMIN, variables });

  const expectToUpdateAttribute = async (
    path: string,
    value: string | Secretary,
    secretary: Secretary
  ) => {
    const { user, admin, apolloClient } = await TestClientGenerator.admin({ secretary });
    const attributes: IUpdateAdmin = {
      uuid: admin.userUuid,
      user: {
        email: user.email,
        name: user.name,
        surname: user.surname
      },
      secretary: admin.secretary
    };
    set(attributes, path, value);
    const { data, errors } = await performQuery(apolloClient, attributes);
    expect(errors).toBeUndefined();
    const updatedUser = await UserRepository.findByUuid(admin.userUuid);
    const updatedAdmin = await AdminRepository.findByUserUuid(admin.userUuid);

    expect(data!.updateAdmin).toEqual({
      uuid: user.uuid,
      user: {
        email: updatedUser.email,
        name: updatedUser.name,
        surname: updatedUser.surname
      },
      secretary: updatedAdmin.secretary
    });
  };

  describe("Extension admin", () => {
    const secretary = Secretary.extension;

    it("update all admin variables", async () => {
      const { admin, apolloClient } = await TestClientGenerator.admin({ secretary });
      const attributes: IUpdateAdmin = {
        uuid: admin.userUuid,
        user: {
          email: EmailGenerator.generate(),
          name: "newName",
          surname: "NewSurname"
        },
        secretary: Secretary.graduados
      };
      const { data, errors } = await performQuery(apolloClient, attributes);
      expect(errors).toBeUndefined();
      expect(data!.updateAdmin).toEqual(attributes);
    });

    it("updates only the email", async () => {
      await expectToUpdateAttribute("user.email", EmailGenerator.generate(), secretary);
    });

    it("updates only the name", async () => {
      await expectToUpdateAttribute("user.name", "Eric", secretary);
    });

    it("updates only the surname", async () => {
      await expectToUpdateAttribute("user.surname", "Clapton", secretary);
    });

    it("updates only the secretary", async () => {
      await expectToUpdateAttribute("user.surname", Secretary.extension, secretary);
    });

    it("returns an error if the email alreadyExists", async () => {
      const { user, admin, apolloClient } = await TestClientGenerator.admin({ secretary });
      const attributes: IUpdateAdmin = {
        uuid: admin.userUuid,
        user: {
          email: extensionAdminUser.email,
          name: user.name,
          surname: user.surname
        },
        secretary: admin.secretary
      };
      const { errors } = await performQuery(apolloClient, attributes);
      expect(errors).toEqualGraphQLErrorType("UserEmailAlreadyExistsError");
    });
  });

  describe("Graduados admin", () => {
    const secretary = Secretary.graduados;

    it("update all admin variables", async () => {
      const { admin, apolloClient } = await TestClientGenerator.admin({ secretary });
      const attributes: IUpdateAdmin = {
        uuid: admin.userUuid,
        user: {
          email: EmailGenerator.generate(),
          name: "newName",
          surname: "NewSurname"
        },
        secretary: Secretary.extension
      };
      const { data, errors } = await performQuery(apolloClient, attributes);
      expect(errors).toBeUndefined();
      expect(data!.updateAdmin).toEqual(attributes);
    });

    it("updates only the email", async () => {
      await expectToUpdateAttribute("user.email", EmailGenerator.generate(), secretary);
    });

    it("updates only the name", async () => {
      await expectToUpdateAttribute("user.name", "Eric", secretary);
    });

    it("updates only the surname", async () => {
      await expectToUpdateAttribute("user.surname", "Clapton", secretary);
    });

    it("updates only the secretary", async () => {
      await expectToUpdateAttribute("user.surname", Secretary.graduados, secretary);
    });

    it("returns an error if the email alreadyExists", async () => {
      const { admin, apolloClient } = await TestClientGenerator.admin({ secretary });
      const attributes: IUpdateAdmin = {
        uuid: admin.userUuid,
        user: {
          email: graduadosAdminUser.email,
          name: "newName",
          surname: "NewSurname"
        },
        secretary: Secretary.extension
      };
      const { errors } = await performQuery(apolloClient, attributes);
      expect(errors).toEqualGraphQLErrorType("UserEmailAlreadyExistsError");
    });
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, defaultExtensionAdminVariables());
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.pending });
    const { errors } = await performQuery(apolloClient, defaultExtensionAdminVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from an approved company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.approved });
    const { errors } = await performQuery(apolloClient, defaultExtensionAdminVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.rejected });
    const { errors } = await performQuery(apolloClient, defaultExtensionAdminVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an approved applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved
    });
    const { errors } = await performQuery(apolloClient, defaultExtensionAdminVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.rejected
    });
    const { errors } = await performQuery(apolloClient, defaultExtensionAdminVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.pending
    });
    const { errors } = await performQuery(apolloClient, defaultExtensionAdminVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
