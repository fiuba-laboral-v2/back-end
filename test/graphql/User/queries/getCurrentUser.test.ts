import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { UserNotFoundError, UserRepository } from "$models/User";
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
        secretary
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
    const { data, errors } = await apolloClient.query({
      query: GET_CURRENT_USER
    });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toEqual({
      email: user.email,
      name: user.name,
      surname: user.surname,
      admin: null,
      applicant: null,
      company: null
    });
  });

  it("returns current admin user if it's set in context", async () => {
    const { admin, user, apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await apolloClient.query({
      query: GET_CURRENT_USER
    });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toEqual({
      email: user.email,
      name: user.name,
      surname: user.surname,
      admin: {
        userUuid: admin.userUuid,
        secretary: admin.secretary
      },
      applicant: null,
      company: null
    });
  });

  it("returns current user applicant if it's set", async () => {
    const { applicant, user, apolloClient } = await TestClientGenerator.applicant();
    const { data, errors } = await apolloClient.query({
      query: GET_CURRENT_USER
    });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toEqual({
      email: user.email,
      name: user.name,
      surname: user.surname,
      admin: null,
      applicant: {
        padron: applicant.padron
      },
      company: null
    });
  });

  it("returns current company user if it's set", async () => {
    const { company, user, apolloClient } = await TestClientGenerator.company();
    const { data, errors } = await apolloClient.query({
      query: GET_CURRENT_USER
    });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toEqual({
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
    });
  });

  it("returns an error it the user is deleted and the cookie is outdated", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    const { errors } = await apolloClient.query({ query: GET_CURRENT_USER });
    expect(errors![0].extensions!.data).toEqual({ errorType: UserNotFoundError.name });
  });

  it("returns null if the current user is not set in context", async () => {
    const { data, errors } = await client.loggedOut().query({ query: GET_CURRENT_USER });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toBeNull();
  });
});
