import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import { Company, CompanyRepository } from "../../../../src/models/Company";
import Database from "../../../../src/config/Database";

const query = gql`
  query ($id: ID!) {
    getCompanyProfileById(id: $id) {
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

test("find a companyProfile given its id", async () => {
  const companyParams = { cuit: "30711819017", companyName: "devartis"};
  const company: Company = await CompanyRepository.save(
    new Company(companyParams)
  );
  const response = await executeQuery(query, { id: company.id });
  expect(response.errors).toBeUndefined();
  expect(response.data).not.toBeUndefined();
  expect(response.data).toEqual({
    getCompanyProfileById: companyParams
  });
});

test("returns error if the CompanyProfile does not exists", async () => {
  const notExistentId: number = 9999;
  const response = await executeQuery(query, { id: notExistentId });
  expect(response.errors).not.toBeUndefined();
});
