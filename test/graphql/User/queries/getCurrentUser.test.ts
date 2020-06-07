import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { UserRepository } from "../../../../src/models/User";
import { testClientFactory } from "../../../mocks/testClientFactory";

const GET_CURRENT_USER = gql`
  query {
    getCurrentUser {
      email
      name
      surname
      isAdmin
      applicant {
        padron
      }
      company {
        uuid
        cuit
        companyName
      }
    }
  }
`;

describe("getCurrentUser", () => {
  beforeAll(() => {
    Database.setConnection();
    return UserRepository.truncate();
  });

  afterAll(() => Database.close());

  it("returns current user if it's set in context", async () => {
    const { user, apolloClient } = await testClientFactory.user();
    const { data, errors } = await apolloClient.query({ query: GET_CURRENT_USER });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toEqual(
      {
        email: user.email,
        name: user.name,
        surname: user.surname,
        isAdmin: false,
        applicant: null,
        company: null
      }
    );
  });

  it("returns current admin user if it's set in context", async () => {
    const { user, apolloClient } = await testClientFactory.admin();
    const { data, errors } = await apolloClient.query({ query: GET_CURRENT_USER });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toEqual(
      {
        email: user.email,
        name: user.name,
        surname: user.surname,
        isAdmin: true,
        applicant: null,
        company: null
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
        isAdmin: false,
        applicant: {
          padron: applicant.padron
        },
        company: null
      }
    );
  });

  it("returns current company user if it's set", async () => {
    const { company, user, apolloClient } = await testClientFactory.company();
    const { data, errors } = await apolloClient.query({ query: GET_CURRENT_USER });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toEqual(
      {
        email: user.email,
        name: user.name,
        surname: user.surname,
        isAdmin: false,
        applicant: null,
        company: {
          uuid: company.uuid,
          cuit: company.cuit,
          companyName: company.companyName
        }
      }
    );
  });

  it("returns null if the current user is not set in context", async () => {
    const { data, errors } = await client.loggedOut().query({ query: GET_CURRENT_USER });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toBeNull();
  });
});
