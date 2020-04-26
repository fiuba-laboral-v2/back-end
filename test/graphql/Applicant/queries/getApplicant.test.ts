import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { ApplicantRepository } from "../../../../src/models/Applicant";
import { Career } from "../../../../src/models/Career";
import { ApplicantNotFound } from "../../../../src/models/Applicant/Errors/ApplicantNotFound";

import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";

import { random } from "faker";
import { UserRepository } from "../../../../src/models/User/Repository";

const GET_APPLICANT = gql`
  query GetApplicant($uuid: ID!) {
    getApplicant(uuid: $uuid) {
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

describe("getApplicantByPadron", () => {

  beforeAll(async () => {
    await Database.setConnection();
    await Career.truncate({ cascade: true });
    await UserRepository.truncate();
  });

  afterAll(async () => {
    await Database.close();
  });

  describe("when the applicant exists", () => {
    it("fetches the applicant", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career]);
      const applicant = await ApplicantRepository.create(applicantData);

      const { data, errors } = await executeQuery(
        GET_APPLICANT, { uuid: applicant.uuid }
      );
      expect(errors).toBeUndefined();
      expect(data).not.toBeUndefined();
      expect(data.getApplicant).toMatchObject({
        name: applicantData.name,
        surname: applicantData.surname,
        description: applicantData.description,
        padron: applicantData.padron
      });
      expect(data.getApplicant).toHaveProperty("capabilities");
      expect(data.getApplicant).toHaveProperty("careers");
      expect(data.getApplicant.careers[0]).toMatchObject({
        code: career.code,
        credits: career.credits,
        description: career.description,
        creditsCount: applicantData.careers[0].creditsCount
      });
    });
  });

  describe("when the applicant doesn't exists", () => {
    it("fetches the applicant", async () => {
      const uuid = random.uuid();
      const { errors } = await executeQuery(GET_APPLICANT, { uuid });

      expect(errors[0].extensions.data).toEqual({ errorType: ApplicantNotFound.name });
    });
  });
});
