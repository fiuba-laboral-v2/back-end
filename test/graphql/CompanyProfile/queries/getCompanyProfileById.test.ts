import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import { CompanyProfile, CompanyProfileRepository } from "../../../../src/models/Company";
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
  await CompanyProfileRepository.truncate();
});

afterAll(async () => {
  await Database.close();
});

test("find a companyProfile given its id", async () => {
  const companyProfileParams = { cuit: "30711819017", companyName: "devartis"};
  const companyProfile: CompanyProfile = await CompanyProfileRepository.save(
    new CompanyProfile(companyProfileParams)
  );
  const response = await executeQuery(query, { id: companyProfile.id });
  expect(response.errors).toBeUndefined();
  expect(response.data).not.toBeUndefined();
  expect(response.data).toEqual({
    getCompanyProfileById: companyProfileParams
  });
});

test("returns error if the CompanyProfile does not exists", async () => {
  const notExistentId: number = 9999;
  const response = await executeQuery(query, { id: notExistentId });
  expect(response.errors).not.toBeUndefined();
});
