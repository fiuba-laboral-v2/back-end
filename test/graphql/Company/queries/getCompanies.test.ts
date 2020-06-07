import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { CompanyRepository } from "../../../../src/models/Company";
import Database from "../../../../src/config/Database";
import { UserRepository } from "../../../../src/models/User";
import { testClientFactory } from "../../../mocks/testClientFactory";

import { AuthenticationError } from "../../../../src/graphql/Errors";

const GET_COMPANIES = gql`
  query {
    getCompanies {
      cuit
      companyName
    }
  }
`;

describe("getCompanies", () => {
  beforeAll(() => {
    Database.setConnection();
    return Promise.all([
      CompanyRepository.truncate(),
      UserRepository.truncate()
    ]);
  });

  afterAll(() => Database.close());

  it("returns all companies", async () => {
    const { company, apolloClient } = await testClientFactory.company();
    const response = await apolloClient.query({ query: GET_COMPANIES });

    expect(response.errors).toBeUndefined();
    expect(response.data).not.toBeUndefined();
    expect(response.data!.getCompanies).toEqual([{
      cuit: company.cuit,
      companyName: company.companyName
    }]);
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();

      const { errors } = await apolloClient.query({ query: GET_COMPANIES });
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });
  });
});
