import { UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { TestClientGenerator } from "$test/generators/TestClient";
import { gql } from "apollo-server";

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
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
  });

  it("can't be accessed by an applicant user", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved
    });
    const { errors } = await apolloClient.query({
      query: APPLICANT_QUERY_ACCESSING_COMPANY_INFO
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
