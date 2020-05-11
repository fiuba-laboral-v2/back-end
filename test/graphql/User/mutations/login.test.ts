import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { UserRepository } from "../../../../src/models/User/Repository";
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

  beforeEach(() => UserRepository.truncate());

  afterAll(() => Database.close());

  it("should return a token", async () => {
    const email = "asd@asd.com";
    const user = await UserRepository.create({
      email: email,
      password: "AValidPassword3",
      name: "name",
      surname: "surname"
    });
    const { data, errors } = await executeMutation(LOGIN, {
      email: email,
      password: "AValidPassword3"
    });
    expect(errors).toBeUndefined();
    const token: string = data!.login;
    expect(JWT.decodeToken(token)).toEqual({
      email: email,
      uuid: user.uuid
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
