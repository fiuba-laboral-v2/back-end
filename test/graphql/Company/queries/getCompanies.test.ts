import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { mockItemsPerPage } from "$test/mocks/config/PaginationConfig";

const GET_COMPANIES = gql`
  query GetCompanies($updatedBeforeThan: PaginatedInput) {
    getCompanies(updatedBeforeThan: $updatedBeforeThan) {
      shouldFetchMore
      results {
        uuid
        cuit
        companyName
        businessName
      }
    }
  }
`;

describe("getCompanies", () => {
  let companies;
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    companies = [
      await CompanyGenerator.instance.withCompleteData(),
      await CompanyGenerator.instance.withCompleteData()
    ];
  });

  it("returns all companies if an Applicant makes the request", async () => {
    const status = ApprovalStatus.approved;
    const { apolloClient } = await TestClientGenerator.applicant({ status });
    const response = await apolloClient.query({ query: GET_COMPANIES });

    expect(response.errors).toBeUndefined();
    expect(response.data).not.toBeUndefined();
    expect(response.data!.getCompanies.results).toEqual(
      expect.arrayContaining(
        companies.map(({ uuid, companyName, cuit, businessName }) => ({
          uuid,
          companyName,
          cuit,
          businessName
        }))
      )
    );
    expect(response.data!.getCompanies.shouldFetchMore).toEqual(false);
  });

  it("returns all companies if an Admin from graduados makes the request", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.graduados });
    const response = await apolloClient.query({ query: GET_COMPANIES });

    expect(response.errors).toBeUndefined();
    expect(response.data).not.toBeUndefined();
    expect(response.data!.getCompanies.results).toEqual(
      expect.arrayContaining(
        companies.map(({ uuid, companyName, cuit, businessName }) => ({
          uuid,
          companyName,
          cuit,
          businessName
        }))
      )
    );
    expect(response.data!.getCompanies.shouldFetchMore).toEqual(false);
  });

  it("returns all companies if an Admin from extension makes the request", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const response = await apolloClient.query({ query: GET_COMPANIES });

    expect(response.errors).toBeUndefined();
    expect(response.data).not.toBeUndefined();
    expect(response.data!.getCompanies.results).toEqual(
      expect.arrayContaining(
        companies.map(({ uuid, companyName, cuit, businessName }) => ({
          uuid,
          companyName,
          cuit,
          businessName
        }))
      )
    );
    expect(response.data!.getCompanies.shouldFetchMore).toEqual(false);
  });

  it("supports pagination", async () => {
    const itemsPerPage = 1;
    mockItemsPerPage(itemsPerPage);
    const { apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await apolloClient.query({ query: GET_COMPANIES });
    expect(errors).toBeUndefined();
    expect(data!.getCompanies.shouldFetchMore).toBe(true);
    expect(data!.getCompanies.results.length).toEqual(1);
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();

      const { errors } = await apolloClient.query({ query: GET_COMPANIES });
      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if the user is from a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const { errors } = await apolloClient.query({ query: GET_COMPANIES });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if the user is a pending applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { errors } = await apolloClient.query({ query: GET_COMPANIES });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if the user is a rejected applicant", async () => {
      const status = ApprovalStatus.rejected;
      const { apolloClient } = await TestClientGenerator.applicant({ status });
      const { errors } = await apolloClient.query({ query: GET_COMPANIES });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
