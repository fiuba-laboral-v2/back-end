import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { Secretary } from "$models/Admin";
import { CurrentUserBuilder } from "$models/CurrentUser";
import { BadCredentialsError } from "$graphql/User/Errors";
import { UserNotFoundError } from "$models/User/Errors";

import { UserGenerator } from "$generators/User";
import { ApplicantGenerator } from "$generators/Applicant";
import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { userTokenAssertions } from "../userTokenAssertions";

const COMPANY_LOGIN = gql`
  mutation($email: String!, $password: String!) {
    companyLogin(email: $email, password: $password)
  }
`;

describe("companyLogin", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  it("creates the cookie for a user", async () => {
    const password = "AValidPassword0";
    const user = await UserGenerator.instance({ password });
    await userTokenAssertions.expectMutationToSetCookie({
      mutation: {
        documentNode: COMPANY_LOGIN,
        variables: { email: user.email, password }
      },
      jwtTokenContents: CurrentUserBuilder.build({
        uuid: user.uuid,
        email: user.email
      })
    });
  });

  it("creates a token for a company user", async () => {
    const password = "AValidPassword2";
    const company = await CompanyGenerator.instance.withMinimumData({
      user: { password }
    });
    const [user] = await company.getUsers();
    await userTokenAssertions.expectMutationToSetCookie({
      mutation: {
        documentNode: COMPANY_LOGIN,
        variables: { email: user.email, password }
      },
      jwtTokenContents: CurrentUserBuilder.build({
        uuid: user.uuid,
        email: user.email,
        company: {
          uuid: company.uuid
        }
      })
    });
  });

  it("returns an error if the user is an applicant", async () => {
    const password = "AValidPassword1";
    const applicant = await ApplicantGenerator.instance.withMinimumData({ password });
    const user = await applicant.getUser();
    const { errors } = await client.loggedOut().mutate({
      mutation: COMPANY_LOGIN,
      variables: { email: user.email, password }
    });
    expect(errors).toIncludeGraphQLErrorType(Error.name);
  });

  it("returns an error if the user is an admin", async () => {
    const password = "AValidPassword3";
    const admin = await AdminGenerator.instance({ secretary: Secretary.extension, password });
    const user = await admin.getUser();
    const { errors } = await client.loggedOut().mutate({
      mutation: COMPANY_LOGIN,
      variables: { email: user.email, password }
    });
    expect(errors).toIncludeGraphQLErrorType(Error.name);
  });

  it("returns error if user does not exist", async () => {
    const { errors } = await client.loggedOut().mutate({
      mutation: COMPANY_LOGIN,
      variables: { email: "asd@asd.com", password: "AValidPassword000" }
    });
    expect(errors).toIncludeGraphQLErrorType(UserNotFoundError.name);
  });

  it("returns and error if the password does not match", async () => {
    const user = await UserGenerator.instance();
    const { errors } = await client.loggedOut().mutate({
      mutation: COMPANY_LOGIN,
      variables: { email: user.email, password: "WrongPassword" }
    });
    expect(errors).toIncludeGraphQLErrorType(BadCredentialsError.name);
  });
});
