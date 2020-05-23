import { gql } from "apollo-server";
import { executeMutation, client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { UserRepository } from "../../../../src/models/User/Repository";
import { ApplicantRepository } from "../../../../src/models/Applicant/Repository";
import { CompanyRepository } from "../../../../src/models/Company";
import { JWT } from "../../../../src/JWT";
import { BadCredentialsError } from "../../../../src/graphql/User/Errors";
import { UserNotFoundError } from "../../../../src/models/User/Errors";

const LOGIN = gql`
  mutation ($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

describe("login", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(() => Promise.all([
    UserRepository.truncate(),
    CompanyRepository.truncate()
  ]));

  afterAll(() => Database.close());

  it("should return a token", async () => {
    const email = "asd@asd.com";
    const user = await UserRepository.create({
      email: email,
      password: "AValidPassword3",
      name: "name",
      surname: "surname"
    });
    const { data, errors } = await client.loggedOut.mutate({
      mutation: LOGIN,
      variables: {
        email: email,
        password: "AValidPassword3"
      }
    });
    expect(errors).toBeUndefined();
    const token: string = data!.login;
    expect(JWT.decodeToken(token)).toEqual({
      email: email,
      uuid: user.uuid
    });
  });

  it("return a token for an applicant user", async () => {
    const email = "asd@asd.com";
    const password = "AValidPassword3";
    const applicant = await ApplicantRepository.create({
      user: {
        email,
        password,
        name: "name",
        surname: "surname"
      },
      padron: 98549,
      careers: []
    });
    const user = await applicant.getUser();
    const { data, errors } = await client.loggedOut.mutate({
      mutation: LOGIN,
      variables: { email, password }
    });
    expect(errors).toBeUndefined();
    const token: string = data!.login;
    expect(JWT.decodeToken(token)).toEqual({
      email: email,
      uuid: user.uuid,
      applicantUuid: applicant.uuid
    });
  });

  it("return a token for an company user", async () => {
    const email = "asd@asd.com";
    const password = "AValidPassword3";
    const company = await CompanyRepository.create({
      user: {
        email,
        password,
        name: "name",
        surname: "surname"
      },
      cuit: "30711819017",
      companyName: "Devartis"
    });
    const user = await UserRepository.findByEmail(email);
    const { data, errors } = await client.loggedOut.mutate({
      mutation: LOGIN,
      variables: { email, password }
    });
    expect(errors).toBeUndefined();
    const token: string = data!.login;
    expect(JWT.decodeToken(token)).toEqual({
      email: email,
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
