import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { IApplicant } from "../../../../src/models/Applicant";

import { CareerRepository } from "../../../../src/models/Career";

import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";

const queryWithAllData = gql`
  mutation SaveApplicant(
    $name: String!, $surname: String!, $padron: Int!, $credits: Int!, $description: String,
    $careers: [Int]!, $capabilities: [String]) {
    saveApplicant(
      name: $name, surname: $surname, padron: $padron, credits: $credits,
      description: $description, careersCodes: $careers, capabilities: $capabilities) {
      name
      surname
      padron
      credits
      description
      capabilities {
        uuid
        description
      }
      careers {
        code
        description
        credits
      }
    }
  }
`;

// const queryWithOnlyObligatoryData = gql`
//   mutation ($cuit: String!, $companyName: String!) {
//     saveCompanyProfile(cuit: $cuit, companyName: $companyName) {
//       cuit
//       companyName
//     }
//   }
// `;

describe("saveCompanyProfile", () => {

  beforeAll(async () => {
    await Database.setConnection();
  });

  // beforeEach(async () => {
  //   await CompanyProfileRepository.truncate();
  //   await CompanyProfilePhoneNumberRepository.truncate();
  //   await CompanyProfilePhotoRepository.truncate();
  // });

  afterAll(async () => {
    await Database.close();
  });

  describe("saveApplicant", () => {
    it("creates a new applicant", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career.code]);

      const response = await executeMutation(queryWithAllData, {
        ...applicantData,
        careers: applicantData.careersCodes
      });
      expect(response.errors).toBeUndefined();
      expect(response.data).not.toBeUndefined();
      expect(response.data.saveApplicant).toMatchObject({
        name: applicantData.name,
        surname: applicantData.surname,
        description: applicantData.description,
        padron: applicantData.padron,
        credits: applicantData.credits
      });
      expect(response.data.saveApplicant).toHaveProperty("capabilities");
    });

    // it("creates companyProfile with only obligatory data", async () => {
    //   const response = await executeMutation(
    //     queryWithOnlyObligatoryData, companyProfileDataWithMinimumData
    //   );
    //   expect(response.errors).toBeUndefined();
    //   expect(response.data).not.toBeUndefined();
    //   expect(response.data).toEqual({ saveCompanyProfile: companyProfileDataWithMinimumData });
    // });
  });
});
