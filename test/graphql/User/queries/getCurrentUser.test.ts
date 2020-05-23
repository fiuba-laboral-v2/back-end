import { gql } from "apollo-server";
import { executeQuery, testCurrentUserEmail } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { UserRepository } from "../../../../src/models/User";
import { testClientFactory } from "../../../mocks/testClientFactory";

const GET_CURRENT_USER = gql`
  query {
    getCurrentUser {
      email
      name
      surname
      applicant {
        padron
      }
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
    const { data, errors } = await executeQuery(GET_CURRENT_USER);
    expect(errors).toBeUndefined();
    expect(data!.getCurrentUser).toEqual(
      {
        email: testCurrentUserEmail,
        name: "name",
        surname: "surname",
        applicant: null
      }
    );
  });

  it("returns current user applicant if it's set", async () => {
    const { applicant, user, apolloClient } = await testClientFactory.applicant();
    const { data, errors } = await apolloClient.query({ query: GET_CURRENT_USER });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toEqual(
      {
        email: user.email,
        name: user.name,
        surname: user.surname,
        applicant: {
          padron: applicant.padron
        }
      }
    );
  });

  it("returns null if the current user is not set in context", async () => {
    const { data, errors } = await executeQuery(GET_CURRENT_USER, {}, { loggedIn: false });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toBeNull();
  });
});
