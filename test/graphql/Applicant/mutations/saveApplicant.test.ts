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
    $name: String!, $surname: String!, $padron: Int!, $credits: Int!, $description: String,
    $careers: [String]!, $capabilities: [String]
    ) {
    saveApplicant(
      name: $name, surname: $surname, padron: $padron, credits: $credits,
      description: $description, careersCodes: $careers, capabilities: $capabilities
    ) {
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

const queryWithOnlyObligatoryData = gql`
  mutation SaveApplicant (
    $name: String!, $surname: String!, $padron: Int!, $credits: Int!, $careers: [String]!
  ) {
    saveApplicant(
      name: $name, surname: $surname, padron: $padron, credits: $credits, careersCodes: $careers
    ) {
      name
      surname
      padron
      credits
      careers {
        code
        description
        credits
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

    it("creates companyProfile with only obligatory data", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career.code]);
      const response = await executeMutation(
        queryWithOnlyObligatoryData,
        {
          ...pick(applicantData, ["name", "surname", "padron", "credits"]),
          careers: applicantData.careersCodes
        }
      );
      expect(response.errors).toBeUndefined();
      expect(response.data).not.toBeUndefined();
      expect(response.data.saveApplicant).toMatchObject(
        pick(applicantData, ["name", "surname", "padron", "credits"])
      );
      expect(response.data.saveApplicant).toHaveProperty("careers");
      expect(response.data.saveApplicant).not.toHaveProperty("capabilities");
      expect(response.data.saveApplicant).not.toHaveProperty("description");
    });
  });
});
