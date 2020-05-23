import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { ApplicantRepository } from "../../../../src/models/Applicant";
import { CareerRepository } from "../../../../src/models/Career";
import { ApplicantNotFound } from "../../../../src/models/Applicant/Errors/ApplicantNotFound";

import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";
import { testClientFactory } from "../../../mocks/testClientFactory";

import { random } from "faker";
import { UserRepository } from "../../../../src/models/User/Repository";

const GET_APPLICANT = gql`
  query GetApplicant($uuid: ID!) {
    getApplicant(uuid: $uuid) {
      user {
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

describe("getApplicant", () => {

  beforeAll(() => Database.setConnection());

  beforeEach(async () => {
    await CareerRepository.truncate();
    await UserRepository.truncate();
  });

  afterAll(() => Database.close());

  describe("when the applicant exists", () => {
    it("fetches the applicant", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantCareer = [{ code: career.code, creditsCount: 150 }]
      const { user, applicant, apolloClient } = await testClientFactory.applicant({ careers: applicantCareer });

      const { data, errors } = await apolloClient.mutate({
        mutation: GET_APPLICANT,
        variables: { uuid: applicant.uuid }
      });

      expect(errors).toBeUndefined();
      expect(data!.getApplicant).toMatchObject({
        user: {
          email: user.email,
          name: user.name,
          surname: user.surname
        },
        description: applicant.description,
        padron: applicant.padron
      });
      expect(data!.getApplicant).toHaveProperty("capabilities");
      expect(data!.getApplicant).toHaveProperty("careers");
      expect(data!.getApplicant.careers[0]).toMatchObject({
        code: career.code,
        credits: career.credits,
        description: career.description,
        creditsCount: applicantCareer[0].creditsCount
      });
    });
  });

  describe("when the applicant doesn't exists", () => {
    it("should return ad error if the applicant does not exist", async () => {
      const uuid = random.uuid();
      const { errors } = await executeQuery(GET_APPLICANT, { uuid });

      expect(errors![0].extensions!.data).toEqual({ errorType: ApplicantNotFound.name });
    });
  });
});
