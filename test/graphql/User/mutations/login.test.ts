import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { User } from "../../../../src/models/User";
import { UserRepository } from "../../../../src/models/User/Repository";
import { JWT } from "../../../../src/JWT";

const LOGIN = gql`
  mutation ($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

describe("User login query", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await User.destroy({ truncate: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("should return error if user is not registered", async () => {
    const response = await executeMutation(LOGIN, {
      email: "asd@asd.com",
      password: "AValidPassword000"
    });
    expect(response.errors[0].message).toEqual(
      `User with email: asd@asd.com does not exist`
    );
  });

  it("checks for password match", async () => {
    const email = "asd@asd.com";
    await UserRepository.create({email: email, password: "AValidPassword1"});
    const response = await executeMutation(LOGIN, {
      email: email,
      password: "AValidPassword2"
    });
    expect(response.errors[0].message).toEqual("Incorrect password");
  });

  it("returns a token", async () => {
    const email = "asd@asd.com";
    const user = await UserRepository.create({email: email, password: "AValidPassword3"});
    const response = await executeMutation(LOGIN, {
      email: email,
      password: "AValidPassword3"
    });
    expect(response.errors).toBeUndefined();
    const token: string = response.data.login;
    expect(JWT.decodeToken(token)).toEqual({
      email: email,
      uuid: user.uuid
    });
  });
});
