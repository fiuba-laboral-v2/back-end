import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { ApplicantNotFound } from "../../../../src/models/Applicant/Errors/ApplicantNotFound";
import { AuthenticationError } from "../../../../src/graphql/Errors";

import { CareerGenerator, TCareerGenerator } from "../../../generators/Career";
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
  let careers: TCareerGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    careers = CareerGenerator.instance();
  });

  afterAll(() => Database.close());

  describe("when the applicant exists", () => {
    it("fetches the applicant", async () => {
      const career = await careers.next().value;
      const applicantCareer = [{ code: career.code, creditsCount: 150 }];
      const {
        user,
        applicant,
        apolloClient
      } = await testClientFactory.applicant({ careers: applicantCareer });

      const { data, errors } = await apolloClient.query({
        query: GET_APPLICANT,
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
    it("returns an error if the applicant does not exist", async () => {
      const { apolloClient } = await testClientFactory.user();

      const uuid = random.uuid();
      const { errors } = await apolloClient.query({
        query: GET_APPLICANT,
        variables: { uuid }
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: ApplicantNotFound.name });
    });
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const uuid = random.uuid();
      const { errors } = await apolloClient.query({
        query: GET_APPLICANT,
        variables: { uuid: uuid }
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });
  });
});
