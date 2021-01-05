import { UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { CareerGenerator } from "$test/generators/Career";
import { OfferGenerator } from "$test/generators/Offer";
import { TestClientGenerator } from "$test/generators/TestClient";
import { gql } from "apollo-server";

const COMPANY_QUERY_ACCESSING_COMPANY_INFO = gql`
  query getMyOffers($updatedBeforeThan: PaginatedInput) {
    getMyOffers(updatedBeforeThan: $updatedBeforeThan) {
      shouldFetchMore
      results {
        uuid
        company {
          users {
            email
          }
        }
      }
    }
  }
`;

const ADMIN_QUERY_ACCESSING_COMPANY_INFO = gql`
  query GetCompanies($updatedBeforeThan: PaginatedInput) {
    getCompanies(updatedBeforeThan: $updatedBeforeThan) {
      shouldFetchMore
      results {
        uuid
        users {
          email
        }
      }
    }
  }
`;

const APPLICANT_QUERY_ACCESSING_COMPANY_INFO = gql`
  query GetCompanies($updatedBeforeThan: PaginatedInput) {
    getCompanies(updatedBeforeThan: $updatedBeforeThan) {
      shouldFetchMore
      results {
        uuid
        users {
          email
        }
      }
    }
  }
`;

describe("GraphQLCompany", () => {
  let companyApolloClient;
  let company;
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    ({ apolloClient: companyApolloClient, company } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    }));
    TestClientGenerator.applicant();
  });

  it("can be access by a company user", async () => {
    const career = await CareerGenerator.instance();
    await OfferGenerator.instance.withObligatoryData({
      companyUuid: company.uuid,
      careers: [{ careerCode: career.code }]
    });

    const { data, errors } = await companyApolloClient.query({
      query: COMPANY_QUERY_ACCESSING_COMPANY_INFO
    });
    expect(errors).toBeUndefined();
    const { company: offerCompany } = data!.getMyOffers.results[0];
    expect(offerCompany.users).toMatchObject(
      (await company.getUsers()).map(({ email }) => ({
        email
      }))
    );
  });

  it("can be access by an admin user", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await apolloClient.query({
      query: ADMIN_QUERY_ACCESSING_COMPANY_INFO
    });
    expect(errors).toBeUndefined();
    const { users } = data!.getCompanies.results[0];
    expect(users).toMatchObject(
      (await company.getUsers()).map(({ email }) => ({
        email
      }))
    );
  });

  it("can't be access by an applicant user", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved
    });
    const { errors } = await apolloClient.query({
      query: APPLICANT_QUERY_ACCESSING_COMPANY_INFO
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
