import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { ApplicantRepository } from "../../../../src/models/Applicant";
import { Career } from "../../../../src/models/Career";
import { Applicant } from "../../../../src/models/Applicant";

import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";
import { UserInputError } from "apollo-server";

const GET_APPLICANT_BY_PADRON = gql`
  query GetApplicantByPadron($padron: Int!) {
    getApplicantByPadron(padron: $padron) {
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
      const applicantData = applicantMocks.applicantData([career.code]);
      const applicant = await ApplicantRepository.create(applicantData);

      const response = await executeQuery(GET_APPLICANT_BY_PADRON, { padron: applicant.padron });
      expect(response.errors).toBeUndefined();
      expect(response.data).not.toBeUndefined();
      expect(response.data.getApplicantByPadron).toMatchObject({
        name: applicantData.name,
        surname: applicantData.surname,
        description: applicantData.description,
        padron: applicantData.padron,
        credits: applicantData.credits
      });
      expect(response.data.getApplicantByPadron).toHaveProperty("capabilities");
      expect(response.data.getApplicantByPadron).toHaveProperty("careers");
    });
  });

  describe("when the applicant doesn't exists", () => {
    it("fetchs the applicant", async () => {
      const response = await executeQuery(GET_APPLICANT_BY_PADRON, { padron: 1 });

      expect(response.errors[0]).toEqual(new UserInputError("Applicant Not found"));
    });
  });
});
