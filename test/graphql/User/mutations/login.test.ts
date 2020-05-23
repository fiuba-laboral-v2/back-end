import { gql } from "apollo-server";
import { executeMutation, client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { UserRepository } from "../../../../src/models/User/Repository";
import { CompanyRepository } from "../../../../src/models/Company";
import { userFactory } from "../../../mocks/user";
import { JWT } from "../../../../src/JWT";
import { BadCredentialsError } from "../../../../src/graphql/User/Errors";
import { UserNotFoundError } from "../../../../src/models/User/Errors";

const LOGIN = gql`
  mutation ($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

describe("login", () => {
  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  afterAll(async () => {
    await Database.close();
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  it("should return a token", async () => {
    const password = "AValidPassword3";
    const user = await userFactory.user(password);
    const { data, errors } = await client.loggedOut.mutate({
      mutation: LOGIN,
      variables: {
        email: user.email,
        password
      }
    });
    expect(errors).toBeUndefined();
    const token: string = data!.login;
    expect(JWT.decodeToken(token)).toEqual({
      email: user.email,
      uuid: user.uuid
    });
  });

  it("returns a token for an applicant user", async () => {
    const password = "AValidPassword3";
    const applicant = await userFactory.applicant(password);
    const user = await applicant.getUser();
    const { data, errors } = await client.loggedOut.mutate({
      mutation: LOGIN,
      variables: { email: user.email, password }
    });
    expect(errors).toBeUndefined();
    const token: string = data!.login;
    expect(JWT.decodeToken(token)).toEqual({
      email: user.email,
      uuid: user.uuid,
      applicantUuid: applicant.uuid
    });
  });

  it("returns a token for an company user", async () => {
    const password = "AValidPassword3";
    const company = await userFactory.company(password);
    const [user] = await company.getUsers();
    const { data, errors } = await client.loggedOut.mutate({
      mutation: LOGIN,
      variables: { email: user.email, password }
    });
    expect(errors).toBeUndefined();
    const token: string = data!.login;
    expect(JWT.decodeToken(token)).toEqual({
      email: user.email,
      uuid: user.uuid,
      companyUuid: company.uuid
    });
  });

  it("should return error if user is not registered", async () => {
    const { errors } = await executeMutation(LOGIN, {
      email: "asd@asd.com",
      password: "AValidPassword000"
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: UserNotFoundError.name });
  });

  it("should return and error if the password does not match", async () => {
    const email = "asd@asd.com";
    await UserRepository.create({
      email: email,
      password: "AValidPassword1",
      name: "name",
      surname: "surname"
    });
    const { errors } = await executeMutation(LOGIN, {
      email: email,
      password: "AValidPassword2"
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: BadCredentialsError.name });
  });
});
