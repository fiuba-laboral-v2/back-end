import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { Secretary } from "$models/Admin";
import { CurrentUserBuilder } from "$models/CurrentUser";

import { BadCredentialsError } from "$graphql/User/Errors";
import { UserNotFoundError } from "$models/User/Errors";

import { ApplicantGenerator } from "$generators/Applicant";
import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { DniGenerator } from "$generators/DNI";
import { FiubaUsersService } from "$services";
import { userTokenAssertions } from "../userTokenAssertions";
import { FiubaCredentials } from "$models/User/Credentials";

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
        email: user.email,
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
        email: user.email,
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

  it("returns an error if the user is from a company", async () => {
    const password = "AValidPassword2";
    const company = await CompanyGenerator.instance.withMinimumData({ user: { password } });
    const [user] = await company.getUsers();
    const apolloClient = client.loggedOut();
    const { errors } = await apolloClient.mutate({
      mutation: FIUBA_LOGIN,
      variables: { dni: user.dni, password }
    });
    expect(errors).not.toBeUndefined();
  });

  it("returns error if user does not exist", async () => {
    const { errors } = await client.loggedOut().mutate({
      mutation: FIUBA_LOGIN,
      variables: { dni: DniGenerator.generate(), password: "AValidPassword000" }
    });
    expect(errors).toEqualGraphQLErrorType(UserNotFoundError.name);
  });
});
