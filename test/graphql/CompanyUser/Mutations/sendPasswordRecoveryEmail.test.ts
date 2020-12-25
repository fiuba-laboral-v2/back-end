import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ISendPasswordRecoveryEmail } from "$graphql/CompanyUser/Mutations/sendPasswordRecoveryEmail";

import { Secretary } from "$models/Admin";
import { UserNotFoundError, UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { EmailService } from "$services";
import jsonWebToken from "jsonwebtoken";

import { TestClientGenerator } from "$generators/TestClient";
import { userTokenAssertions } from "$test/graphql/User/userTokenAssertions";

const SEND_PASSWORD_RECOVERY_EMAIL = gql`
  mutation SendPasswordRecoveryEmail($email: String!) {
    sendPasswordRecoveryEmail(email: $email)
  }
`;

describe("sendPasswordRecoveryEmail", () => {
  const emailSendMock = jest.fn();

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  beforeEach(() => {
    emailSendMock.mockClear();
    jest.spyOn(EmailService, "send").mockImplementation(emailSendMock);
  });

  const performQuery = (apolloClient: TestClient, variables: ISendPasswordRecoveryEmail) =>
    apolloClient.mutate({ mutation: SEND_PASSWORD_RECOVERY_EMAIL, variables });

  it("sends an email to a companyUser for the password recovery", async () => {
    const token = "token";
    jest.spyOn(jsonWebToken, "sign").mockImplementation(() => token);
    const { user } = await TestClientGenerator.company();
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, { email: user.email });
    expect(errors).toBeUndefined();
    expect(emailSendMock.mock.calls).toEqual([
      [
        {
          receiverEmails: [user.email],
          sender: {
            email: "no-reply@fi.uba.ar",
            name: "[No responder] Bolsa de Trabajo FIUBA"
          },
          subject: "Recuperación de contraseña",
          body:
            "Usted ha solicitado la recuperación de su contraseña." +
            "\n" +
            "Haga click en el siguiente link para realizar el cambio." +
            "\n" +
            `baseUrl/subDomain/empresa/contrasena/recuperar/?token=${token}`
        }
      ]
    ]);
  });

  it("returns an error if the email belongs to an applicant", async () => {
    const { user } = await TestClientGenerator.applicant();
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, { email: user.email });
    expect(errors).toEqualGraphQLErrorType(UserNotFoundError.name);
  });

  it("returns an error if the email belongs to an admin", async () => {
    const { user } = await TestClientGenerator.admin();
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, { email: user.email });
    expect(errors).toEqualGraphQLErrorType(UserNotFoundError.name);
  });

  it("returns an error if an approved company user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.company({
      status: ApprovalStatus.approved,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, { email: user.email });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if a pending company user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.company({
      status: ApprovalStatus.pending,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, { email: user.email });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if a rejected company user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.company({
      status: ApprovalStatus.rejected,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, { email: user.email });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if an approved applicant user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, { email: user.email });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if a rejected applicant user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.applicant({
      status: ApprovalStatus.rejected,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, { email: user.email });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if a pending applicant user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.applicant({
      status: ApprovalStatus.pending,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, { email: user.email });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if an extension admin user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.admin({
      secretary: Secretary.extension,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, { email: user.email });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if a graduados admin user is already logged in", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient, user } = await TestClientGenerator.admin({
      secretary: Secretary.graduados,
      expressContext
    });
    const { errors } = await performQuery(apolloClient, { email: user.email });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });
});
