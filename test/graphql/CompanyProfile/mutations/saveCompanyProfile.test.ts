import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { ICompanyProfile } from "../../../../src/graphql/CompanyProfile";
import { CompanyProfileRepository } from "../../../../src/models/CompanyProfile";
import {
  CompanyProfilePhoneNumberRepository
} from "../../../../src/models/CompanyProfilePhoneNumber";

const query = gql`
    mutation ($cuit: String!, $companyName: String!, $slogan: String, $description: String,
        $logo: String, $phoneNumbers: [Int]) {
        saveCompanyProfile(cuit: $cuit, companyName: $companyName, slogan: $slogan,
            description: $description, logo: $logo, phoneNumbers: $phoneNumbers) {
          cuit
          companyName
          slogan
          description
          logo
          phoneNumbers
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
    cuit: "30-71181901-7",
    companyName: "devartis",
    slogan: "We craft web applications for great businesses",
    description: "some description",
    logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg",
    phoneNumbers: [
      43076555,
      43076556,
      43076557
    ]
  };
  const response = await executeMutation(query, companyProfileParams);
  expect(response).not.toBeNull();
  expect(response).not.toBeUndefined();
  expect(response.errors).toBeUndefined();
  expect(response).toHaveProperty("data");
  expect(response.data).toEqual({
    saveCompanyProfile: companyProfileParams});
});

