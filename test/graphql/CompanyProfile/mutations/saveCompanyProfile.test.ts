import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { ICompanyProfile } from "../../../../src/graphql/CompanyProfile";
import { CompanyProfileRepository } from "../../../../src/models/CompanyProfile";
import {
  CompanyProfilePhoneNumberRepository
} from "../../../../src/models/CompanyProfilePhoneNumber";

const query = gql`
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

beforeAll(async () => {
  await Database.setConnection();
});

beforeEach(async () => {
  await CompanyProfileRepository.truncate();
  await CompanyProfilePhoneNumberRepository.truncate();
});

afterAll(async () => {
  await Database.close();
});

test("create companyProfile", async () => {
  const companyProfileParams: ICompanyProfile = {
    cuit: "30711819017",
    companyName: "devartis",
    slogan: "We craft web applications for great businesses",
    description: "some description",
    logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg",
    phoneNumbers: [
      43076555,
      43076556,
      43076557
    ],
    photos: [
      "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQV" +
      "QI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
      "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAHAAACNbyblAAAAHElEQV" +
      "QI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
    ]
  };
  const response = await executeMutation(query, companyProfileParams);
  expect(response.errors).toBeUndefined();
  expect(response).toHaveProperty("data");
  expect(response.data).toEqual({
    saveCompanyProfile: companyProfileParams});
});

