import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import { Company, CompanyRepository } from "../../../../src/models/Company";
import { companyMockData, phoneNumbers, photos } from "../../../models/Company/mocks";
import Database from "../../../../src/config/Database";

const query = gql`
  query ($id: ID!) {
    getCompanyById(id: $id) {
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

describe("getCompanyById", () => {
  const companyCompleteData = {
    ...companyMockData,
    ...{ photos: photos, phoneNumbers: phoneNumbers }
  };
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await CompanyRepository.truncate();
  });

  afterAll(async () => {
    await Database.close();
  });

  it("finds a company given its id", async () => {
    const company: Company = await CompanyRepository.create(
      companyCompleteData
    );
    const response = await executeQuery(query, { id: company.id });
    expect(response.errors).toBeUndefined();
    expect(response.data).not.toBeUndefined();
    expect(response.data).toEqual({
      getCompanyById: companyCompleteData
    });
  });

  it("returns error if the Company does not exists", async () => {
    const notExistentId = 9999;
    const response = await executeQuery(query, { id: notExistentId });
    expect(response.errors).not.toBeUndefined();
  });

  it("find a company with photos with an empty array", async () => {
    const company: Company = await CompanyRepository.create(
      companyMockData
    );
    const response = await executeQuery(query, { id: company.id });
    expect(response.errors).toBeUndefined();
    expect(response.data).not.toBeUndefined();
    expect(response.data.getCompanyById.photos).toHaveLength(0);
  });
});
