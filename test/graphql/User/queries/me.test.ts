import { gql } from "apollo-server";
import { executeQuery, testCurrentUserEmail } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { UserRepository } from "../../../../src/models/User/Repository";
import { User } from "../../../../src/models/User";

const ME = gql`
  query {
    me {
      email
    }
  }
`;

describe("Current User query", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await User.destroy({ truncate: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("returns current user if it's set in context", async () => {
    await UserRepository.create({ email: testCurrentUserEmail, password: "SomeCoolSecret123" });
    const response = await executeQuery(ME);
    expect(response.errors).toBeUndefined();
    expect(response.data).toEqual({ me: { email: testCurrentUserEmail } });
  });

  it("returns error if the current user is not set in context", async () => {
    const loggedIn = false;
    const response = await executeQuery(ME, {}, loggedIn);
    expect(response.errors[0].message).toEqual("You are not authenticated");
  });
});
