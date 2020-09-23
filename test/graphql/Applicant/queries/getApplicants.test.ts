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
import { mockItemsPerPage } from "$test/mocks/config/PaginationConfig";

const GET_APPLICANTS = gql`
  query GetApplicants($updatedBeforeThan: PaginatedInput) {
    getApplicants(updatedBeforeThan: $updatedBeforeThan) {
      shouldFetchMore
      results {
        uuid
        user {
          email
          name
          surname
        }
        padron
        description
        updatedAt
        capabilities {
          uuid
          description
        }
        careers {
          careerCode
          career {
            code
            description
          }
          approvedSubjectCount
          currentCareerYear
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
  }
`;

describe("getApplicants", () => {
  let admin: Admin;

  beforeAll(async () => {
    await CareerRepository.truncate();
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    admin = await AdminGenerator.instance({ secretary: Secretary.extension });
  });

  describe("when no applicant exists", () => {
    it("fetches an empty array of applicants", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const { data, errors } = await apolloClient.query({ query: GET_APPLICANTS });
      expect(errors).toBeUndefined();
      expect(data!.getApplicants.shouldFetchMore).toEqual(false);
      expect(data!.getApplicants.results).toEqual([]);
    });
  });

  describe("when applicants exists", () => {
    it("fetches the existing applicant", async () => {
      const newCareer = await CareerGenerator.instance();
      const applicantCareer = { careerCode: newCareer.code, isGraduate: true };
      const { user, applicant, apolloClient } = await TestClientGenerator.applicant({
        careers: [applicantCareer],
        status: { approvalStatus: ApprovalStatus.approved, admin }
      });

      const { data, errors } = await apolloClient.query({ query: GET_APPLICANTS });

      expect(errors).toBeUndefined();
      const [career] = await applicant.getCareers();
      const capabilities = await applicant.getCapabilities();
      expect(data!.getApplicants.shouldFetchMore).toEqual(false);
      expect(data!.getApplicants.results).toEqual(
        expect.arrayContaining([
          {
            uuid: applicant.uuid,
            user: {
              email: user.email,
              name: user.name,
              surname: user.surname
            },
            padron: applicant.padron,
            description: applicant.description,
            updatedAt: applicant.updatedAt.toISOString(),
            capabilities: capabilities.map(({ uuid, description }) => ({ uuid, description })),
            careers: [
              {
                career: {
                  code: career.code,
                  description: career.description
                },
                ...applicantCareer,
                approvedSubjectCount: null,
                currentCareerYear: null
              }
            ],
            sections: [],
            links: []
          }
        ])
      );
    });

    it("allows an applicant user to fetch all applicants", async () => {
      const newCareer = await CareerGenerator.instance();
      const applicantCareerData = {
        careerCode: newCareer.code,
        approvedSubjectCount: 20,
        currentCareerYear: 3,
        isGraduate: false
      };
      const { applicant: firstApplicant, apolloClient } = await TestClientGenerator.applicant({
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
            updatedAt: applicant.updatedAt.toISOString(),
            careers: [
              {
                career: {
                  code: newCareer.code,
                  description: newCareer.description
                },
                ...applicantCareerData
              }
            ],
            capabilities: capabilities.map(({ uuid, description }) => ({ uuid, description })),
            links: [],
            sections: []
          };
        })
      );
      expect(data!.getApplicants.shouldFetchMore).toEqual(false);
      expect(data!.getApplicants.results).toEqual(expect.arrayContaining(expectedApplicants));
    });

    it("gets the next 2 Applicants and should fetch more should be true", async () => {
      const itemsPerPage = 2;
      mockItemsPerPage(itemsPerPage);
      const { apolloClient } = await TestClientGenerator.admin();
      const { data, errors } = await apolloClient.query({ query: GET_APPLICANTS });
      expect(errors).toBeUndefined();
      expect(data!.getApplicants.shouldFetchMore).toBe(true);
      expect(data!.getApplicants.results.length).toEqual(2);
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
