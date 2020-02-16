import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { ICompany } from "../../../../src/models/Company";
import { CompanyRepository } from "../../../../src/models/Company";
import {
  CompanyPhoneNumberRepository
} from "../../../../src/models/CompanyPhoneNumber";
import { CompanyPhotoRepository } from "../../../../src/models/CompanyPhoto";
import {
  companyMockData,
  phoneNumbers,
  photos
} from "../../../models/Company/mocks";

const queryWithAllData = gql`
  mutation (
    $cuit: String!, $companyName: String!, $slogan: String, $description: String,
    $logo: String, $website: String, $email: String, $phoneNumbers: [Int], $photos: [String]) {
    saveCompanyProfile(
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

const queryWithOnlyObligatoryData = gql`
  mutation ($cuit: String!, $companyName: String!) {
    saveCompanyProfile(cuit: $cuit, companyName: $companyName) {
      cuit
      companyName
    }
  }
`;

describe("saveCompanyProfile", () => {
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

  describe("saveCompanyProfile", () => {
    const companyProfileData: ICompany = {
      ...companyMockData,
      ...{ photos: photos, phoneNumbers: phoneNumbers }
    };

    const companyProfileDataWithMinimumData = {
      cuit: "30711819017",
      companyName: "devartis"
    };

    it("create companyProfile", async () => {
      const response = await executeMutation(queryWithAllData, companyProfileData);
      expect(response.errors).toBeUndefined();
      expect(response.data).not.toBeUndefined();
      expect(response.data).toEqual({ saveCompanyProfile: companyProfileData });
    });

    it("creates companyProfile with only obligatory data", async () => {
      const response = await executeMutation(
        queryWithOnlyObligatoryData, companyProfileDataWithMinimumData
      );
      expect(response.errors).toBeUndefined();
      expect(response.data).not.toBeUndefined();
      expect(response.data).toEqual({ saveCompanyProfile: companyProfileDataWithMinimumData });
    });
  });
});
