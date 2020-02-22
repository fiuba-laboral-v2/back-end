import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { Career } from "../../../../src/models/Career";
import { Applicant } from "../../../../src/models/Applicant";

import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";

import pick from "lodash/pick";

const queryWithAllData = gql`
  mutation SaveApplicant(
    $name: String!, $surname: String!, $padron: Int!, $description: String,
    $careers: [CareerCredits]!, $capabilities: [String]
    ) {
    saveApplicant(
      name: $name, surname: $surname, padron: $padron,
      description: $description, careers: $careers, capabilities: $capabilities
    ) {
      name
      surname
      padron
      description
      capabilities {
        uuid
        description
      }
      careers {
        code
        description
        credits
        creditsCount
      }
    }
  }
`;

const queryWithOnlyObligatoryData = gql`
  mutation SaveApplicant (
    $name: String!, $surname: String!, $padron: Int!, $careers: [CareerCredits]!
  ) {
    saveApplicant(
      name: $name, surname: $surname, padron: $padron, careers: $careers
    ) {
      name
      surname
      padron
      careers {
        code
        description
        credits
        creditsCount
      }
    }
  }
`;

describe("saveApplicant", () => {

  beforeAll(async () => {
    await Database.setConnection();
    await Career.truncate({ cascade: true });
    await Applicant.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  describe("when the input is valid", () => {
    it("creates a new applicant", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career.code]);

      const {data, errors} = await executeMutation(queryWithAllData, {
        ...applicantData
      });
      expect(errors).toBeUndefined();
      expect(data).not.toBeUndefined();
      expect(data.saveApplicant).toMatchObject({
        name: applicantData.name,
        surname: applicantData.surname,
        description: applicantData.description,
        padron: applicantData.padron
      });
      expect(data.saveApplicant).toHaveProperty("capabilities");
      expect(data.saveApplicant.careers[0]).toMatchObject({
        code: career.code,
        credits: career.credits,
        description: career.description,
        creditsCount: applicantData.careers[0].creditsCount
      });
    });

    it("creates companyProfile with only obligatory data", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career.code]);
      const {data, errors}  = await executeMutation(
        queryWithOnlyObligatoryData,
        {
          ...pick(applicantData, ["name", "surname", "padron", "credits", "careers"])
        }
      );
      expect(errors).toBeUndefined();
      expect(data).not.toBeUndefined();
      expect(data.saveApplicant).toMatchObject(
        pick(applicantData, ["name", "surname", "padron", "credits"])
      );
      expect(data.saveApplicant).toHaveProperty("careers");
      expect(data.saveApplicant).not.toHaveProperty("capabilities");
      expect(data.saveApplicant).not.toHaveProperty("description");
      expect(data.saveApplicant.careers[0]).toMatchObject({
        code: career.code,
        credits: career.credits,
        description: career.description,
        creditsCount: applicantData.careers[0].creditsCount
      });
    });
  });
});
