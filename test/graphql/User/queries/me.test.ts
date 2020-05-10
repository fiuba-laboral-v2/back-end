import { gql } from "apollo-server";
import { executeQuery, testCurrentUserEmail } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { UserRepository } from "../../../../src/models/User/Repository";
import { AuthenticationError } from "../../../../src/graphql/Errors";

const ME = gql`
  query {
    me {
      email
      name
      surname
    }
  }
`;

describe("Current User query", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(() => UserRepository.truncate());

  afterAll(() => Database.close());

  it("returns current user if it's set in context", async () => {
    await UserRepository.create({
      email: testCurrentUserEmail,
      password: "SomeCoolSecret123",
      name: "name",
      surname: "surname"
    });
    const { data, errors } = await executeQuery(ME);
    expect(errors).toBeUndefined();
    expect(data!.me).toEqual(
      {
        email: testCurrentUserEmail,
        name: "name",
        surname: "surname"
      }
    );
  });

  it("returns error if the current user is not set in context", async () => {
    const { errors } = await executeQuery(ME, { }, { loggedIn: false });
    expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
  });
});
