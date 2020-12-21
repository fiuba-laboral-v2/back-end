import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { ISaveAdmin } from "$graphql/Admin/Mutations/saveAdmin";
import { FiubaUsersService } from "$services";
import {
  BadCredentialsError,
  FiubaCredentials,
  UserNotFoundError,
  UserRepository
} from "$models/User";
import { CareerRepository } from "$models/Career";
import { AdminRepository, Secretary } from "$models/Admin";
import { CompanyRepository } from "$models/Company";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { UserGenerator } from "$generators/User";
import { TestClientGenerator } from "$generators/TestClient";
import { ApplicantGenerator } from "$generators/Applicant";
import { UUID_REGEX } from "$test/models";
import { omit } from "lodash";

const SAVE_ADMIN = gql`
  mutation SaveAdmin($user: UserInput!, $secretary: Secretary!) {
    saveAdmin(user: $user, secretary: $secretary) {
      uuid
      user {
        uuid
        email
        dni
        name
        surname
      }
      secretary
    }
  }
`;

describe("saveAdmin", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const generateVariables = (secretary: Secretary) => ({
    user: UserGenerator.data.fiubaUser(),
    secretary
  });

  const performQuery = (apolloClient: TestClient, variables: ISaveAdmin) =>
    apolloClient.query({ query: SAVE_ADMIN, variables });

  const expectToCreateAnAdmin = async (secretary: Secretary, variables?: ISaveAdmin) => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const adminVariables = variables || generateVariables(secretary);
    const { data, errors } = await performQuery(apolloClient, adminVariables);
    expect(errors).toBeUndefined();
    expect(data!.saveAdmin).toEqual({
      uuid: expect.stringMatching(UUID_REGEX),
      user: {
        uuid: expect.stringMatching(UUID_REGEX),
        ...omit(adminVariables.user, "password")
      },
      secretary
    });
  };

  it("creates an extension admin", async () => {
    await expectToCreateAnAdmin(Secretary.extension);
  });

  it("creates a graduados admin", async () => {
    await expectToCreateAnAdmin(Secretary.graduados);
  });

  it("creates an admin that was already an applicant", async () => {
    const applicant = await ApplicantGenerator.instance.student();
    const user = await UserRepository.findByUuid(applicant.userUuid);
    await expectToCreateAnAdmin(Secretary.graduados, {
      secretary: Secretary.graduados,
      user: {
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: "mySecret",
        dni: (user.credentials as FiubaCredentials).dni
      }
    });
  });

  it("does not create user fi the admin creation fails", async () => {
    const secretary = Secretary.graduados;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const adminVariables = generateVariables(secretary);
    jest.spyOn(AdminRepository, "save").mockImplementation(() => {
      throw new Error();
    });
    const { errors } = await performQuery(apolloClient, adminVariables);
    expect(errors).not.toBeUndefined();
    await expect(
      UserRepository.findFiubaUserByDni(adminVariables.user.dni)
    ).rejects.toThrowErrorWithMessage(
      UserNotFoundError,
      UserNotFoundError.buildMessage({ dni: adminVariables.user.dni })
    );
  });

  it("returns an error if the admin already exists", async () => {
    const secretary = Secretary.graduados;
    const { apolloClient, admin } = await TestClientGenerator.admin({ secretary });
    const user = await UserRepository.findByUuid(admin.userUuid);
    const { errors } = await performQuery(apolloClient, {
      secretary: admin.secretary,
      user: {
        name: user.name,
        surname: user.surname,
        email: user.email,
        dni: (user.credentials as FiubaCredentials).dni,
        password: "mySecret"
      }
    });
    expect(errors).toEqualGraphQLErrorType("AdminAlreadyExistsError");
  });

  it("returns an error if the fiuba credentials are invalid", async () => {
    jest.spyOn(FiubaUsersService, "authenticate").mockImplementation(async () => false);
    const secretary = Secretary.graduados;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performQuery(apolloClient, generateVariables(secretary));
    expect(errors).toEqualGraphQLErrorType(BadCredentialsError.name);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, generateVariables(Secretary.extension));
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.pending });
    const { errors } = await performQuery(apolloClient, generateVariables(Secretary.extension));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from an approved company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.approved });
    const { errors } = await performQuery(apolloClient, generateVariables(Secretary.extension));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.rejected });
    const { errors } = await performQuery(apolloClient, generateVariables(Secretary.extension));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an approved applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved
    });
    const { errors } = await performQuery(apolloClient, generateVariables(Secretary.extension));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.rejected
    });
    const { errors } = await performQuery(apolloClient, generateVariables(Secretary.extension));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.pending
    });
    const { errors } = await performQuery(apolloClient, generateVariables(Secretary.extension));
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
