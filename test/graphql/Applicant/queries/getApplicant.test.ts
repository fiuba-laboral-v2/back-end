import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { ApplicantRepository } from "../../../../src/models/Applicant";
import { Career } from "../../../../src/models/Career";
import { Applicant } from "../../../../src/models/Applicant";

import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";
import { ApolloError } from "apollo-server";

import { random } from "faker";

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
    await Applicant.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  describe("when the applicant exists", () => {
    it("fetchs the applicant", async () => {
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
    it("fetchs the applicant", async () => {
      const uuid = random.uuid();
      const response = await executeQuery(GET_APPLICANT, { uuid });

      expect(response.errors[0]).toEqual(
        new ApolloError(`Applicant with uuid: ${uuid} does not exist`)
      );
    });
  });
});
