import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { User } from "../../../../src/models/User";
import { UserRepository } from "../../../../src/models/User/Repository";
import { JWT } from "../../../../src/JWT";

const SIGNUP = gql`
  mutation ($email: String!, $password: String!) {
    signup(email: $email, password: $password)
  }
`;

describe("User signup query", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await User.destroy({ truncate: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("should return an error if password is invalid", async () => {
    const response = await executeMutation(SIGNUP, {
      email: "asd@asd.com",
      password: "an invalid password"
    });
    expect(response.errors).not.toBeNull();
  });

  it("creates a valid user", async () => {
    const email = "bbb@eee.com";
    await executeMutation(SIGNUP, {
      email: email,
      password: "AValidPassword000"
    });
    expect((await UserRepository.findByEmail(email)).email).toBe(email);
  });

  it("returns a token", async () => {
    const response = await executeMutation(SIGNUP, {
      email: "asd@asd.com",
      password: "AValidPassword000"
    });
    expect(response.errors).toBeUndefined();
    const token: string = response.data.signup;
    expect(JWT.decodeToken(token).email).toEqual("asd@asd.com");
  });
});
