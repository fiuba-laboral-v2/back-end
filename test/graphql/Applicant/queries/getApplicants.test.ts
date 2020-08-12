import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { CareerRepository } from "$models/Career";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { ApprovalStatus } from "$models/ApprovalStatus";

import { CareerGenerator } from "$generators/Career";
import { TestClientGenerator } from "$generators/TestClient";
import { AdminGenerator } from "$generators/Admin";
import { ApplicantGenerator } from "$generators/Applicant";
import { Secretary } from "$models/Admin";
import { Admin } from "$models";

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
          careerCode
          career {
            code
            description
            credits
          }
          creditsCount
          isGraduate
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
  let admin: Admin;

  beforeAll(async () => {
    await CareerRepository.truncate();
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    admin = await AdminGenerator.instance(Secretary.extension);
  });

  describe("when no applicant exists", () => {
    it("fetches an empty array of applicants", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const { data, errors } = await apolloClient.query({ query: GET_APPLICANTS });
      expect(errors).toBeUndefined();
      expect(data!.getApplicants).toEqual([]);
    });
  });

  describe("when applicants exists", () => {
    it("fetches the existing applicant", async () => {
      const newCareer = await CareerGenerator.instance();
      const applicantCareer = { code: newCareer.code, creditsCount: 150, isGraduate: true };
      const {
        user,
        applicant,
        apolloClient
      } = await TestClientGenerator.applicant({
        careers: [applicantCareer],
        status: { approvalStatus: ApprovalStatus.approved, admin }
      });

      const { data, errors } = await apolloClient.query({ query: GET_APPLICANTS });

      expect(errors).toBeUndefined();
      const [career] = await applicant.getCareers();
      const capabilities = await applicant.getCapabilities();
      expect(data!.getApplicants).toEqual(expect.arrayContaining([{
        uuid: applicant.uuid,
        user: {
          email: user.email,
          name: user.name,
          surname: user.surname
        },
        padron: applicant.padron,
        description: applicant.description,
        capabilities: capabilities.map(({ uuid, description }) => ({ uuid, description })),
        careers: [{
          career: {
            code: career.code,
            description: career.description,
            credits: career.credits
          },
          careerCode: applicantCareer.code,
          creditsCount: applicantCareer.creditsCount,
          isGraduate: applicantCareer.isGraduate
        }],
        sections: [],
        links: []
      }]));
    });

    it("allows an applicant user to fetch all applicants", async () => {
      const newCareer = await CareerGenerator.instance();
      const applicantCareerData = { code: newCareer.code, creditsCount: 150, isGraduate: false };
      const {
        applicant: firstApplicant,
        apolloClient
      } = await TestClientGenerator.applicant({
        careers: [applicantCareerData],
        capabilities: ["Go"],
        status: { approvalStatus: ApprovalStatus.approved, admin }
      });
      const secondApplicant = await ApplicantGenerator.instance.withMinimumData({
        careers: [applicantCareerData],
        capabilities: ["Go"]
      });
      const applicants = [firstApplicant, secondApplicant];

      const { data, errors } = await apolloClient.query({ query: GET_APPLICANTS });
      expect(errors).toBeUndefined();

      const expectedApplicants = await Promise.all(
        applicants.map(async applicant => {
          const user = await applicant.getUser();
          const capabilities = await applicant.getCapabilities();
          return {
            uuid: applicant.uuid,
            user: {
              email: user.email,
              name: user.name,
              surname: user.surname
            },
            padron: applicant.padron,
            description: applicant.description,
            careers: [{
              career: {
                code: newCareer.code,
                description: newCareer.description,
                credits: newCareer.credits
              },
              careerCode: applicantCareerData.code,
              creditsCount: applicantCareerData.creditsCount,
              isGraduate: applicantCareerData.isGraduate
            }],
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
      const apolloClient = client.loggedOut();

      const { errors } = await apolloClient.query({ query: GET_APPLICANTS });
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("returns an error if current user is pending applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { errors } = await apolloClient.query({ query: GET_APPLICANTS });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if current user is rejected applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: { approvalStatus: ApprovalStatus.rejected, admin }
      });
      const { errors } = await apolloClient.query({ query: GET_APPLICANTS });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if current user is from company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const { errors } = await apolloClient.query({ query: GET_APPLICANTS });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});
