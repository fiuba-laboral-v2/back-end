import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import { Company, CompanyRepository } from "../../../../src/models/Company";
import Database from "../../../../src/config/Database";

const query = gql`
  query {
    getCompanies {
      cuit
      companyName
    }
  }
`;

beforeAll(async () => {
  await Database.setConnection();
});

beforeEach(async () => {
  await CompanyRepository.truncate();
});

afterAll(async () => {
  await Database.close();
});

test("returns all companies", async () => {
  const companyParams = { cuit: "30711819017", companyName: "devartis" };
  await CompanyRepository.save(new Company(companyParams));
  const response = await executeQuery(query);

  expect(response.errors).toBeUndefined();
  expect(response.data).not.toBeUndefined();
  expect(response.data).toEqual({
    getCompanies: [ companyParams ]
  });
});
