import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { Database } from "../../../../src/config/Database";

import { UserRepository } from "../../../../src/models/User";
import { CareerRepository } from "../../../../src/models/Career";
import { Career } from "../../../../src/models";

import { ApplicantGenerator, TApplicantDataGenerator } from "../../../generators/Applicant";
import { CareerGenerator } from "../../../generators/Career";

const SAVE_APPLICANT_WITH_COMPLETE_DATA = gql`
  mutation SaveApplicant(
      $user: UserInput!,
      $padron: Int!,
      $careers: [CareerCredits]!,
      $description: String,
      $capabilities: [String]
    ) {
    saveApplicant(
        user: $user,
        padron: $padron,
        description: $description,
        careers: $careers,
        capabilities: $capabilities
    ) {
      uuid
      user {
        uuid
        email
        name
        surname
      }
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

const SAVE_APPLICANT_WITH_ONLY_OBLIGATORY_DATA = gql`
  mutation SaveApplicant (
      $user: UserInput!,
      $padron: Int!,
      $careers: [CareerCredits]!
  ) {
    saveApplicant(
        user: $user,
        padron: $padron,
        careers: $careers
    ) {
      uuid
      user {
        uuid
        email
        name
        surname
      }
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
  let applicantsData: TApplicantDataGenerator;
  let career: Career;

  beforeAll(async () => {
    Database.setConnection();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    applicantsData = ApplicantGenerator.data.minimum();
    career = await CareerGenerator.instance().next().value;
  });

  afterAll(() => Database.close());

  describe("when the input is valid", () => {
    it("creates a new applicant", async () => {
      const applicantData = applicantsData.next().value;

      const { data, errors } = await client.loggedOut().mutate({
        mutation: SAVE_APPLICANT_WITH_COMPLETE_DATA,
        variables: {
          ...applicantData,
          careers: [{ code: career.code, creditsCount: career.credits - 1 }]
        }
      });
      expect(errors).toBeUndefined();
      expect(data!.saveApplicant.user).toHaveProperty("uuid");
      expect(data!.saveApplicant).toMatchObject({
        user: {
          email: applicantData.user.email,
          name: applicantData.user.name,
          surname: applicantData.user.surname
        },
        description: applicantData.description,
        padron: applicantData.padron
      });
      expect(data!.saveApplicant).toHaveProperty("capabilities");
      expect(data!.saveApplicant.careers).toMatchObject([{
        code: career.code,
        credits: career.credits,
        description: career.description,
        creditsCount: career.credits - 1
      }]);
    });

    it("creates applicant with only obligatory data", async () => {
      const applicantData = applicantsData.next().value;
      const { data, errors } = await client.loggedOut().mutate({
        mutation: SAVE_APPLICANT_WITH_ONLY_OBLIGATORY_DATA,
        variables: {
          ...applicantData,
          careers: [{ code: career.code, creditsCount: career.credits - 1 }]
        }
      });
      expect(errors).toBeUndefined();
      expect(data!.saveApplicant.user).toHaveProperty("uuid");
      expect(data!.saveApplicant).toMatchObject(
        {
          user: {
            email: applicantData.user.email,
            name: applicantData.user.name,
            surname: applicantData.user.surname
          },
          padron: applicantData.padron
        }
      );
      expect(data!.saveApplicant).toHaveProperty("careers");
      expect(data!.saveApplicant).not.toHaveProperty("capabilities");
      expect(data!.saveApplicant).not.toHaveProperty("description");
      expect(data!.saveApplicant.careers).toMatchObject([{
        code: career.code,
        credits: career.credits,
        description: career.description,
        creditsCount: career.credits - 1
      }]);
    });
  });

  describe("Errors", () => {
    it("should throw and error if the user exists", async () => {
      const applicantData = applicantsData.next().value;
      await UserRepository.create(applicantData.user);
      const { errors } = await client.loggedOut().mutate({
        mutation: SAVE_APPLICANT_WITH_ONLY_OBLIGATORY_DATA,
        variables: applicantData
      });
      expect(errors![0].extensions!.data).toEqual(
        { errorType: "UserEmailAlreadyExistsError" }
      );
    });
  });
});
