import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { CompanyRepository } from "../../../../src/models/Company";
import { UserRepository } from "../../../../src/models/User";
import { UserMocks } from "../../../models/User/mocks";
import { companyMocks } from "../../../models/Company/mocks";

const SAVE_COMPANY_WITH_COMPLETE_DATA = gql`
  mutation (
    $cuit: String!, $companyName: String!, $slogan: String, $description: String,
    $logo: String, $website: String, $email: String, $phoneNumbers: [String],
    $photos: [String], $user: UserInput!) {
    createCompany(
      cuit: $cuit, companyName: $companyName, slogan: $slogan, description: $description,
      logo: $logo, website: $website, email: $email, phoneNumbers: $phoneNumbers,
      photos: $photos, user: $user) {
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

const SAVE_COMPANY_WITH_MINIMUM_DATA = gql`
  mutation ($cuit: String!, $companyName: String!, $user: UserInput!) {
    createCompany(cuit: $cuit, companyName: $companyName, user: $user) {
      cuit
      companyName
    }
  }
`;

describe("createCompany", () => {
  beforeAll(() => Database.setConnection());
  beforeEach(() => Promise.all([
    CompanyRepository.truncate(),
    UserRepository.truncate()
  ]));
  afterAll(() => Database.close());

  describe("When the creation succeeds", () => {
    it("create company", async () => {
      const response = await executeMutation(
        SAVE_COMPANY_WITH_COMPLETE_DATA,
        companyMocks.completeData()
      );
      expect(response.errors).toBeUndefined();
      expect(response.data).not.toBeUndefined();
      expect(response.data).toEqual({ createCompany: companyMocks.completeDataWithoutUser() });
    });

    it("creates company with only obligatory data", async () => {
      const response = await executeMutation(
        SAVE_COMPANY_WITH_MINIMUM_DATA, companyMocks.minimumData()
      );
      expect(response.errors).toBeUndefined();
      expect(response.data).not.toBeUndefined();
      expect(response.data).toEqual({ createCompany: companyMocks.minimumDataWithoutUser() });
    });
  });

  describe("when the creation errors", () => {
    it("should throw an error if the company with its cuit already exist", async () => {
      await executeMutation(
        SAVE_COMPANY_WITH_MINIMUM_DATA,
        companyMocks.minimumData()
      );
      const { errors } = await executeMutation(
        SAVE_COMPANY_WITH_MINIMUM_DATA,
        {
          ...companyMocks.minimumData(),
          user: { ...UserMocks.userAttributes, email: "qwe@qwe.qwe" }
        }
      );
      expect(errors![0].extensions!.data).toEqual(
        { errorType: "CompanyCuitAlreadyExistsError" }
      );
    });
  });
});
