import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import { CompanyProfile, CompanyProfileRepository } from "../../../../src/models/CompanyProfile";
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
  const companyProfileParams = { cuit: "30-71181901-7", companyName: "devartis"};
  const companyProfile: CompanyProfile = await CompanyProfileRepository.save(
    new CompanyProfile(companyProfileParams)
  );
  const response = await executeQuery(query, { id: companyProfile.id });
  expect(response).not.toBeNull();
  expect(response).not.toBeUndefined();
  expect(response.errors).toBeUndefined();
  expect(response.data).not.toBeUndefined();
  expect(response.data).toEqual({
    getCompanyProfileById: companyProfileParams
  });
});

test("returns null if the CompanyProfile does no exists", async () => {
  const notExistentId: number = 9999;
  const response = await executeQuery(query, { id: notExistentId });
  expect(response).not.toBeNull();
  expect(response).not.toBeUndefined();
  expect(response.errors).toBeUndefined();
  expect(response.data).not.toBeUndefined();
  expect(response.data).toEqual({
    getCompanyProfileById: null
  });
});
