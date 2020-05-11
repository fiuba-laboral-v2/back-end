import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { CompanyRepository, ICompany } from "../../../../src/models/Company";
import { CompanyPhoneNumberRepository } from "../../../../src/models/CompanyPhoneNumber";
import { CompanyPhotoRepository } from "../../../../src/models/CompanyPhoto";
import { companyMockDataWithoutUser, phoneNumbers, photos } from "../../../models/Company/mocks";
import { UserRepository } from "../../../../src/models/User";
import { UserMocks } from "../../../models/User/mocks";

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

const companyDataWithoutUser = {
  ...companyMockDataWithoutUser,
  photos: photos,
  phoneNumbers: phoneNumbers
};

const companyData: ICompany = {
  ...companyDataWithoutUser,
  user: UserMocks.userAttributes
};

const companyDataWithMinimumDataWithoutUser = {
  cuit: "30711819017",
  companyName: "devartis"
};

const companyDataWithMinimumData = {
  ...companyDataWithMinimumDataWithoutUser,
  user: UserMocks.userAttributes
};

describe("createCompany", () => {
  beforeAll(() => Database.setConnection());
  beforeEach(() => Promise.all([
    CompanyRepository.truncate(),
    CompanyPhoneNumberRepository.truncate(),
    CompanyPhotoRepository.truncate(),
    UserRepository.truncate()
  ]));
  afterAll(() => Database.close());

  describe("When the creation succeeds", () => {
    it("create company", async () => {
      const response = await executeMutation(SAVE_COMPANY_WITH_COMPLETE_DATA, companyData);
      expect(response.errors).toBeUndefined();
      expect(response.data).not.toBeUndefined();
      expect(response.data).toEqual(
        {
          createCompany: {
            ...companyDataWithoutUser,
            phoneNumbers: expect.arrayContaining(companyData.phoneNumbers)
          }
        }
      );
    });

    it("creates company with only obligatory data", async () => {
      const response = await executeMutation(
        SAVE_COMPANY_WITH_MINIMUM_DATA, companyDataWithMinimumData
      );
      expect(response.errors).toBeUndefined();
      expect(response.data).not.toBeUndefined();
      expect(response.data).toEqual({ createCompany: companyDataWithMinimumDataWithoutUser });
    });
  });

  describe("when the creation errors", () => {
    it("should throw an error if the company with its cuit already exist", async () => {
      await executeMutation(
        SAVE_COMPANY_WITH_MINIMUM_DATA,
        companyDataWithMinimumData
      );
      const { errors } = await executeMutation(
        SAVE_COMPANY_WITH_MINIMUM_DATA,
        {
          ...companyDataWithMinimumData,
          user: { ...UserMocks.userAttributes, email: "qwe@qwe.qwe" }
        }
      );
      expect(errors[0].extensions.data).toEqual(
        { errorType: "CompanyCuitAlreadyExistsError" }
      );
    });
  });
});
