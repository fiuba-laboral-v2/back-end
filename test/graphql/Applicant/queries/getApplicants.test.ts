import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { AuthenticationError } from "../../../../src/graphql/Errors";

import { CareerRepository } from "../../../../src/models/Career";
import { UserRepository } from "../../../../src/models/User/Repository";

import { careerMocks } from "../../../models/Career/mocks";
import { testClientFactory } from "../../../mocks/testClientFactory";
import { userFactory } from "../../../mocks/user";

const GET_APPLICANTS = gql`
    query getApplicants {
        getApplicants {
            uuid
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
            sections {
              title
              text
            }
            links {
              name
              url
            }
        }
    }
`;

describe("getApplicants", () => {

  beforeAll(() => {
    Database.setConnection();
    return Promise.all([
      CareerRepository.truncate(),
      UserRepository.truncate()
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      CareerRepository.truncate(),
      UserRepository.truncate()
    ]);
    return Database.close();
  });

  describe("when no applicant exists", () => {
    it("should fetch an empty array of applicants", async () => {
      const { apolloClient } = await testClientFactory.user();
      const { data, errors } = await apolloClient.query({ query: GET_APPLICANTS });
      expect(errors).toBeUndefined();
      expect(data!.getApplicants).toEqual([]);
    });
  });

  describe("when applicants exists", () => {
    it("should fetch the existing applicant", async () => {
      const newCareer = await CareerRepository.create(careerMocks.careerData());
      const applicantCareer = [{ code: newCareer.code, creditsCount: 150 }];
      const {
        user,
        applicant,
        apolloClient
      } = await testClientFactory.applicant({ careers: applicantCareer });

      const { data, errors } = await apolloClient.query({ query: GET_APPLICANTS });

      expect(errors).toBeUndefined();
      const [career] = await applicant.getCareers();
      const capabilities = await applicant.getCapabilities();
      expect(data!.getApplicants[0]).toMatchObject({
        user: {
          email: user.email,
          name: user.name,
          surname: user.surname
        },
        padron: applicant.padron,
        description: applicant.description,
        capabilities: capabilities.map(({ uuid, description }) => ({ uuid, description })),
        careers: [{
          code: career.code,
          description: career.description,
          credits: career.credits,
          creditsCount: applicantCareer[0].creditsCount
        }],
        sections: [],
        links: []
      });
    });

    it("should fetch all the applicants", async () => {
      const newCareer = await CareerRepository.create(careerMocks.careerData());
      const applicantCareer = [{ code: newCareer.code, creditsCount: 150 }];
      const {
        applicant: firstApplicant,
        apolloClient
      } = await testClientFactory.applicant({ careers: applicantCareer, capabilities: ["Go"] });
      const secondApplicant = await userFactory.applicant({
        careers: applicantCareer,
        capabilities: ["Go"]
      });
      const applicants = [firstApplicant, secondApplicant];

      const { data, errors } = await apolloClient.query({ query: GET_APPLICANTS });
      expect(errors).toBeUndefined();

      const expectedApplicants = await Promise.all(
        applicants.map(async applicant => {
          const user = await applicant.getUser();
          const capabilities = await applicant.getCapabilities();
          const careerApplicants = await applicant.getCareersApplicants();
          return {
            uuid: applicant.uuid,
            user: {
              email: user.email,
              name: user.name,
              surname: user.surname
            },
            padron: applicant.padron,
            description: applicant.description,
            careers: await Promise.all(
              careerApplicants.map(async careerApplicant => {
                const { code, description, credits } = await careerApplicant.getCareer();
                return {
                  code,
                  description,
                  creditsCount: careerApplicant.creditsCount,
                  credits
                };
              })
            ),
            capabilities: capabilities.map(({ uuid, description }) => ({ uuid, description })),
            links: [],
            sections: []
          };
        })
      );
      expect(data!.getApplicants).toEqual(expect.arrayContaining(expectedApplicants));
    });
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut;

      const { errors } = await apolloClient.query({ query: GET_APPLICANTS });
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });
  });
});
