import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import { Company, CompanyRepository } from "../../../../src/models/Company";
import { companyMocks } from "../../../models/Company/mocks";
import Database from "../../../../src/config/Database";
import { UserRepository } from "../../../../src/models/User";

const query = gql`
  query ($uuid: ID!) {
    getCompanyByUuid(uuid: $uuid) {
      cuit
      companyName
      slogan
      description
      logo
      website
      email
      phoneNumbers
      photos
    }
  }
`;

describe("getCompanyByUuid", () => {
  beforeAll(() => Database.setConnection());
  beforeEach(() => Promise.all([
    CompanyRepository.truncate(),
    UserRepository.truncate()
  ]));
  afterAll(() => Database.close());

  it("finds a company given its uuid", async () => {
    const company: Company = await CompanyRepository.create(companyMocks.completeData());
    const response = await executeQuery(query, { uuid: company.uuid });
    expect(response.errors).toBeUndefined();
    expect(response.data).not.toBeUndefined();
    expect(response.data).toEqual({ getCompanyByUuid: companyMocks.completeDataWithoutUser() });
  });

  it("returns error if the Company does not exists", async () => {
    const notExistentUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const response = await executeQuery(query, { uuid: notExistentUuid });
    expect(response.errors).not.toBeUndefined();
  });

  it("find a company with photos with an empty array", async () => {
    const company: Company = await CompanyRepository.create(companyMocks.companyData());
    const { data, errors } = await executeQuery(query, { uuid: company.uuid });
    expect(errors).toBeUndefined();
    expect(data).not.toBeUndefined();
    expect(data!.getCompanyByUuid.photos).toHaveLength(0);
  });
});
