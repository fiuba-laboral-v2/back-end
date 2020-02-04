import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { ICompanyProfile } from "../../../../src/models/CompanyProfile";
import { CompanyProfileRepository } from "../../../../src/models/CompanyProfile";
import {
  CompanyProfilePhoneNumberRepository
} from "../../../../src/models/CompanyProfilePhoneNumber";
import { CompanyProfilePhotoRepository } from "../../../../src/models/CompanyProfilePhoto";

const queryWithAllData = gql`
  mutation (
    $cuit: String!, $companyName: String!, $slogan: String, $description: String,
    $logo: String, $phoneNumbers: [Int], $photos: [String]) {
    saveCompanyProfile(
        cuit: $cuit, companyName: $companyName, slogan: $slogan, description: $description,
        logo: $logo, phoneNumbers: $phoneNumbers, photos: $photos) {
      cuit
      companyName
      slogan
      description
      logo
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

beforeAll(async () => {
  await Database.setConnection();
});

beforeEach(async () => {
  await CompanyProfileRepository.truncate();
  await CompanyProfilePhoneNumberRepository.truncate();
  await CompanyProfilePhotoRepository.truncate();
});

afterAll(async () => {
  await Database.close();
});

describe("saveCompanyProfile", () => {
  const companyProfileData: ICompanyProfile = {
    cuit: "30711819017",
    companyName: "devartis",
    slogan: "We craft web applications for great businesses",
    description: "some description",
    logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg",
    phoneNumbers: [
      43076555,
      43076556,
      43076455,
      43076599
    ],
    photos: [
      `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//
        8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`,
      `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//
        8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`
    ]
  };

  const companyProfileDataWithMinimumData = {
    cuit: "30711819017",
    companyName: "devartis"
  };

  test("create companyProfile", async () => {
    const response = await executeMutation(queryWithAllData, companyProfileData);
    expect(response.errors).toBeUndefined();
    expect(response.data).not.toBeUndefined();
    expect(response.data).toEqual({ saveCompanyProfile: companyProfileData });
  });

  test("create companyProfile with only obligatory data", async () => {
    const response = await executeMutation(
      queryWithOnlyObligatoryData, companyProfileDataWithMinimumData
    );
    expect(response.errors).toBeUndefined();
    expect(response.data).not.toBeUndefined();
    expect(response.data).toEqual({ saveCompanyProfile: companyProfileDataWithMinimumData });
  });
});
