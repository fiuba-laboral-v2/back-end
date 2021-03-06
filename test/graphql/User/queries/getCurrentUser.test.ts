import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { UserNotFoundError, UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { TestClientGenerator } from "$generators/TestClient";
import { Secretary } from "$models/Admin";
import { userTokenAssertions } from "../userTokenAssertions";

const GET_CURRENT_USER = gql`
  query {
    getCurrentUser {
      email
      name
      surname
      admin {
        user {
          uuid
        }
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
    const expressContext = userTokenAssertions.createExpressContext();
    const { user, apolloClient } = await TestClientGenerator.user({ expressContext });
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
    const expressContext = userTokenAssertions.createExpressContext();
    const { admin, user, apolloClient } = await TestClientGenerator.admin({
      expressContext,
      secretary: Secretary.extension
    });
    const { data, errors } = await apolloClient.query({
      query: GET_CURRENT_USER
    });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toEqual({
      email: user.email,
      name: user.name,
      surname: user.surname,
      admin: {
        user: { uuid: user.uuid },
        secretary: admin.secretary
      },
      applicant: null,
      company: null
    });
  });

  it("returns current user applicant if it's set", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { applicant, user, apolloClient } = await TestClientGenerator.applicant({
      expressContext
    });
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
    const expressContext = userTokenAssertions.createExpressContext();
    const { company, user, apolloClient } = await TestClientGenerator.company({ expressContext });
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

  it("removes the cookie if the user does not exist", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient } = await TestClientGenerator.company({ expressContext });
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    const { errors } = await apolloClient.query({ query: GET_CURRENT_USER });
    expect(errors).toEqualGraphQLErrorType(UserNotFoundError.name);
    userTokenAssertions.expectCookieToBeRemoved(expressContext);
  });

  it("returns an error if the user is deleted and the cookie is outdated", async () => {
    const expressContext = userTokenAssertions.createExpressContext();
    const { apolloClient } = await TestClientGenerator.company({ expressContext });
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    const { errors } = await apolloClient.query({ query: GET_CURRENT_USER });
    expect(errors).toEqualGraphQLErrorType(UserNotFoundError.name);
  });

  it("returns null if the current user is not set in context", async () => {
    const { data, errors } = await client.loggedOut().query({ query: GET_CURRENT_USER });
    expect(errors).toBeUndefined();
    expect(data?.getCurrentUser).toBeNull();
  });
});
