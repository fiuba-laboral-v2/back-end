import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { CompanyUserRepository } from "$models/CompanyUser";
import { UserRepository } from "$models/User";
import { TestClientGenerator } from "$test/generators/TestClient";
import { gql } from "apollo-server";

const COMPANY_QUERY_ACCESSING_COMPANY_USER = gql`
  query {
    getMyCompanyUser {
      uuid
      companyUuid
      position
      user {
        uuid
        name
        surname
        email
      }
    }
  }
`;

describe("GraphQLCompanyUser", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    TestClientGenerator.applicant();
    TestClientGenerator.admin();
  });
  it("can be access by a company user", async () => {
    const { apolloClient, company, user } = await TestClientGenerator.company();
    const { data, errors } = await apolloClient.query({
      query: COMPANY_QUERY_ACCESSING_COMPANY_USER
    });
    expect(errors).toBeUndefined();
    const myCompanyUser = await CompanyUserRepository.findByUserUuid(user.uuid!);
    expect(data!.getMyCompanyUser).toEqual({
      uuid: myCompanyUser.uuid,
      companyUuid: company.uuid,
      position: myCompanyUser.position,
      user: {
        uuid: user.uuid,
        name: user.name,
        surname: user.surname,
        email: user.email
      }
    });
  });
  // There are currently no queries that can access this information from an admin or an applicant
  // it("can be access by an admin user", async () => {});
  // it("can't be access by an applicant user", () => {});
});
