import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { TestClientGenerator } from "$generators/TestClient";

const GET_CURRENT_USER = gql`
  query {
    getCurrentUser {
      email
      name
      surname
      admin {
        userUuid
      }
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
  beforeAll(async () => {
    await UserRepository.truncate();
    return CompanyRepository.truncate();
  });

  it("returns current user if it's set in context", async () => {
    const { user, apolloClient } = await TestClientGenerator.user();
    const { data, errors } = await apolloClient.query({ query: GET_CURRENT_USER });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toEqual(
      {
        email: user.email,
        name: user.name,
        surname: user.surname,
        admin: null,
        applicant: null,
        company: null
      }
    );
  });

  it("returns current admin user if it's set in context", async () => {
    const { admin, user, apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await apolloClient.query({ query: GET_CURRENT_USER });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toEqual(
      {
        email: user.email,
        name: user.name,
        surname: user.surname,
        admin: {
          userUuid: admin.userUuid
        },
        applicant: null,
        company: null
      }
    );
  });

  it("returns current user applicant if it's set", async () => {
    const { applicant, user, apolloClient } = await TestClientGenerator.applicant();
    const { data, errors } = await apolloClient.query({ query: GET_CURRENT_USER });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toEqual(
      {
        email: user.email,
        name: user.name,
        surname: user.surname,
        admin: null,
        applicant: {
          padron: applicant.padron
        },
        company: null
      }
    );
  });

  it("returns current company user if it's set", async () => {
    const { company, user, apolloClient } = await TestClientGenerator.company();
    const { data, errors } = await apolloClient.query({ query: GET_CURRENT_USER });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toEqual(
      {
        email: user.email,
        name: user.name,
        surname: user.surname,
        admin: null,
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
