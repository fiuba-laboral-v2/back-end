import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import { CompanyRepository } from "../../../../src/models/Company";
import Database from "../../../../src/config/Database";
import { UserMocks } from "../../../models/User/mocks";
import { UserRepository } from "../../../../src/models/User";

const query = gql`
  query {
    getCompanies {
      cuit
      companyName
    }
  }
`;

describe("getCompanies", () => {
  beforeAll(() => Database.setConnection());
  beforeEach(() => Promise.all([
    CompanyRepository.truncate(),
    UserRepository.truncate()
  ]));
  afterAll(() => Database.close());

  it("returns all companies", async () => {
    const companyParams = { cuit: "30711819017", companyName: "devartis" };
    await CompanyRepository.create({ ...companyParams, user: UserMocks.userAttributes });
    const response = await executeQuery(query);

    expect(response.errors).toBeUndefined();
    expect(response.data).not.toBeUndefined();
    expect(response.data).toEqual({
      getCompanies: [companyParams]
    });
  });
});
