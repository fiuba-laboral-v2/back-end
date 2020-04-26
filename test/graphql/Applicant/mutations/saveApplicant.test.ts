import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { UniqueConstraintError } from "sequelize";

import { Career, CareerRepository } from "../../../../src/models/Career";

import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";

import { pick } from "lodash";
import { UserRepository } from "../../../../src/models/User/Repository";
import { ApplicantRepository } from "../../../../src/models/Applicant";

const queryWithAllData = gql`
  mutation SaveApplicant(
    $name: String!, $surname: String!, $padron: Int!, $user: UserInput!,
    $careers: [CareerCredits]!, $description: String, $capabilities: [String]
    ) {
    saveApplicant(
      name: $name, surname: $surname, padron: $padron,
      description: $description, careers: $careers, capabilities: $capabilities,
      user: $user
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
    $name: String!, $surname: String!, $padron: Int!,
    $careers: [CareerCredits]!, $user: UserInput!
  ) {
    saveApplicant(
        name: $name, surname: $surname, padron: $padron, careers: $careers, user: $user
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
    await UserRepository.truncate();
  });

  beforeEach(() => UserRepository.truncate());

  afterAll(async () => {
    await Database.close();
  });

  describe("when the input is valid", () => {
    it("creates a new applicant", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career]);

      const { data, errors } = await executeMutation(queryWithAllData, {
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
      const applicantData = applicantMocks.applicantData([career]);
      const { data, errors } = await executeMutation(
        queryWithOnlyObligatoryData,
        {
          ...pick(applicantData, ["name", "surname", "padron", "credits", "careers", "user"])
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

  describe("Errors", () => {
    it("should throw and error if the user exists", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career]);
      await UserRepository.create(applicantData.user);
      const { errors } = await executeMutation(queryWithOnlyObligatoryData, applicantData);
      expect(errors[0].extensions.data).toEqual(
        {
          errorType: UniqueConstraintError.name,
          parameters: {
            table: "Users",
            columns: ["email"]
          }
        }
      );
    });
  });
});
