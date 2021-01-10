import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { Company } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { CompanyRepository, IFindLatest } from "$models/Company";
import { UserRepository } from "$models/User";
import { CareerRepository } from "$models/Career";

import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";
import { mockItemsPerPage } from "$test/mocks/config/PaginationConfig";

const GET_COMPANIES = gql`
  query GetCompanies(
    $updatedBeforeThan: PaginatedInput
    $companyName: String
    $businessSector: String
  ) {
    getCompanies(
      updatedBeforeThan: $updatedBeforeThan
      companyName: $companyName
      businessSector: $businessSector
    ) {
      shouldFetchMore
      results {
        uuid
        cuit
        companyName
        businessName
        businessSector
        hasAnInternshipAgreement
      }
    }
  }
`;

describe("getCompanies", () => {
  let devartis: Company;
  let despegar: Company;
  let companies: Company[];
  let companyUuids: string[];

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    const generator = CompanyGenerator.instance.withCompleteData;
    devartis = await generator({ companyName: "Devartis", businessSector: "Servicios" });
    despegar = await generator({ companyName: "Despegar", businessSector: "Viajes" });
    companies = [devartis, despegar];
    companyUuids = companies.map(({ uuid }) => uuid);
  });

  const getCompanies = (apolloClient: TestClient, variables?: IFindLatest) =>
    apolloClient.query({ query: GET_COMPANIES, variables });

  it("returns all companies if an Applicant makes the request", async () => {
    const status = ApprovalStatus.approved;
    const { apolloClient } = await TestClientGenerator.applicant({ status });
    const { errors, data } = await getCompanies(apolloClient);

    expect(errors).toBeUndefined();
    const { results, shouldFetchMore } = data!.getCompanies;
    expect(results.map(({ uuid }) => uuid)).toEqual(expect.arrayContaining(companyUuids));
    expect(shouldFetchMore).toEqual(false);
  });

  it("returns companies filtered by name and businessSector", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const response = await getCompanies(apolloClient, {
      companyName: "Despegar",
      businessSector: "Viajes"
    });

    expect(response.errors).toBeUndefined();
    const { results, shouldFetchMore } = response.data!.getCompanies;
    expect(results.map(({ uuid }) => uuid)).toEqual([despegar.uuid]);
    expect(shouldFetchMore).toEqual(false);
  });

  it("returns companies filtered by name", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.graduados });
    const response = await getCompanies(apolloClient, { companyName: "Devartis" });

    expect(response.errors).toBeUndefined();
    const { results, shouldFetchMore } = response.data!.getCompanies;
    expect(results.map(({ uuid }) => uuid)).toEqual([devartis.uuid]);
    expect(shouldFetchMore).toEqual(false);
  });

  it("returns companies filtered by businessSector", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const response = await getCompanies(apolloClient, { businessSector: "Viajés" });

    expect(response.errors).toBeUndefined();
    const { results, shouldFetchMore } = response.data!.getCompanies;
    expect(results.map(({ uuid }) => uuid)).toEqual([despegar.uuid]);
    expect(shouldFetchMore).toEqual(false);
  });

  it("supports pagination", async () => {
    const itemsPerPage = 1;
    mockItemsPerPage(itemsPerPage);
    const { apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await getCompanies(apolloClient);
    expect(errors).toBeUndefined();
    expect(data!.getCompanies.shouldFetchMore).toBe(true);
    expect(data!.getCompanies.results.length).toEqual(1);
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();

      const { errors } = await getCompanies(apolloClient);
      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if the user is from a pending company", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: ApprovalStatus.pending
      });
      const { errors } = await getCompanies(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if the user is from a rejected company", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: ApprovalStatus.rejected
      });
      const { errors } = await getCompanies(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if the user is from an approved company", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: ApprovalStatus.approved
      });
      const { errors } = await getCompanies(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if the user is a pending applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { errors } = await getCompanies(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if the user is a rejected applicant", async () => {
      const status = ApprovalStatus.rejected;
      const { apolloClient } = await TestClientGenerator.applicant({ status });
      const { errors } = await getCompanies(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
