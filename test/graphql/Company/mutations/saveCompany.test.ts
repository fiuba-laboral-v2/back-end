import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { CompanyRepository } from "../../../../src/models/Company";
import { CompanyPhoneNumberRepository } from "../../../../src/models/CompanyPhoneNumber";
import { CompanyPhotoRepository } from "../../../../src/models/CompanyPhoto";
import { companyMocks } from "../../../models/Company/mocks";

const SAVE_COMPANY_WITH_COMPLETE_DATA = gql`
  mutation (
    $cuit: String!, $companyName: String!, $slogan: String, $description: String,
    $logo: String, $website: String, $email: String, $phoneNumbers: [String], $photos: [String]) {
    saveCompany(
        cuit: $cuit, companyName: $companyName, slogan: $slogan, description: $description,
        logo: $logo, website: $website, email: $email, phoneNumbers: $phoneNumbers,
        photos: $photos) {
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
  mutation ($cuit: String!, $companyName: String!) {
    saveCompany(cuit: $cuit, companyName: $companyName) {
      cuit
      companyName
    }
  }
`;

describe("saveCompany", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await CompanyRepository.truncate();
    await CompanyPhoneNumberRepository.truncate();
    await CompanyPhotoRepository.truncate();
  });

  afterAll(async () => {
    await Database.close();
  });

  const companyData = companyMocks.completeData();

  const companyDataWithMinimumData = {
    cuit: "30711819017",
    companyName: "devartis"
  };

  describe("When the creation succeeds", () => {

    it("create company", async () => {
      const response = await executeMutation(SAVE_COMPANY_WITH_COMPLETE_DATA, companyData);
      expect(response.errors).toBeUndefined();
      expect(response.data).not.toBeUndefined();
      expect(response.data).toEqual(
        {
          saveCompany: {
            ...companyData,
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
      expect(response.data).toEqual({ saveCompany: companyDataWithMinimumData });
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
        companyDataWithMinimumData
      );
      expect(errors[0].extensions.data).toEqual(
        { errorType: "CompanyCuitAlreadyExistsError" }
      );
    });
  });
});
