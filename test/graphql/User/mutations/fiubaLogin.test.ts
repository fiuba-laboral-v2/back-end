import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { UserRepository, FiubaCredentials } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { Secretary } from "$models/Admin";
import { CurrentUserBuilder } from "$models/CurrentUser";
import { FiubaUsersService } from "$services";

import { UserNotFoundError, BadCredentialsError } from "$models/User/Errors";

import { UserGenerator } from "$generators/User";
import { ApplicantGenerator } from "$generators/Applicant";
import { AdminGenerator } from "$generators/Admin";
import { DniGenerator } from "$generators/DNI";
import { userTokenAssertions } from "../userTokenAssertions";

const FIUBA_LOGIN = gql`
  mutation($dni: String!, $password: String!) {
    fiubaLogin(dni: $dni, password: $password)
  }
`;

describe("fiubaLogin", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  it("creates the cookie for an applicant user", async () => {
    const password = "AValidPassword1";
    const applicant = await ApplicantGenerator.instance.withMinimumData({ password });
    const user = await UserRepository.findByUuid(applicant.userUuid);
    await userTokenAssertions.expectMutationToSetCookie({
      mutation: {
        documentNode: FIUBA_LOGIN,
        variables: { dni: (user.credentials as FiubaCredentials).dni, password }
      },
      jwtTokenContents: CurrentUserBuilder.build({
        uuid: user.uuid!,
        applicant: { uuid: applicant.uuid }
      })
    });
  });

  it("creates a token for an admin", async () => {
    const password = "AValidPassword1";
    const admin = await AdminGenerator.instance({ secretary: Secretary.extension, password });
    const user = await UserRepository.findByUuid(admin.userUuid);
    await userTokenAssertions.expectMutationToSetCookie({
      mutation: {
        documentNode: FIUBA_LOGIN,
        variables: { dni: (user.credentials as FiubaCredentials).dni, password }
      },
      jwtTokenContents: CurrentUserBuilder.build({
        uuid: user.uuid!,
        admin: {
          userUuid: admin.userUuid
        }
      })
    });
  });

  it("returns an error if the fiuba service rejects authentication attempt", async () => {
    const password = "AValidPassword1";
    const applicant = await ApplicantGenerator.instance.withMinimumData({ password });
    jest.spyOn(FiubaUsersService, "authenticate").mockImplementationOnce(async () => false);
    const user = await UserRepository.findByUuid(applicant.userUuid);
    const { errors } = await client.loggedOut().mutate({
      mutation: FIUBA_LOGIN,
      variables: { dni: (user.credentials as FiubaCredentials).dni, password }
    });
    expect(errors).toEqualGraphQLErrorType(BadCredentialsError.name);
  });

  it("returns an error if dni is not persisted", async () => {
    const password = "AValidPassword2";
    const apolloClient = client.loggedOut();
    const { errors } = await apolloClient.mutate({
      mutation: FIUBA_LOGIN,
      variables: { dni: DniGenerator.generate(), password }
    });
    expect(errors).toEqualGraphQLErrorType(UserNotFoundError.name);
  });

  it("returns error if user does not exist", async () => {
    const { errors } = await client.loggedOut().mutate({
      mutation: FIUBA_LOGIN,
      variables: { dni: DniGenerator.generate(), password: "AValidPassword000" }
    });
    expect(errors).toEqualGraphQLErrorType(UserNotFoundError.name);
  });

  it("returns error if user is not an admin or an applicant", async () => {
    const user = await UserGenerator.fiubaUser();
    const dni = (user.credentials as FiubaCredentials).dni;
    const { errors } = await client.loggedOut().mutate({
      mutation: FIUBA_LOGIN,
      variables: { dni, password: "AValidPassword000" }
    });
    expect(errors).toEqualGraphQLErrorType(BadCredentialsError.name);
  });
});
