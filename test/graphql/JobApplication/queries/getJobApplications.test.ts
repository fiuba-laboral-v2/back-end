import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient } from "apollo-server-testing";

import { UserRepository } from "$models/User";
import { Admin, JobApplication } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { JobApplicationRepository } from "$models/JobApplication";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";

import { range } from "lodash";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { Secretary } from "$src/models/Admin";
import { JobApplicationGenerator } from "$test/generators/JobApplication";

const GET_JOB_APPLICATIONS = gql`
  query getJobApplications($updatedBeforeThan: PaginatedInput) {
    getJobApplications(updatedBeforeThan: $updatedBeforeThan) {
      shouldFetchMore
      results {
        uuid
        updatedAt
        createdAt
        approvalStatus
        offer {
          uuid
          title
          company {
            companyName
          }
        }
        applicant {
          uuid
          user {
            name
            surname
          }
        }
      }
    }
  }
`;

describe("getJobApplications", () => {
  let admin: Admin;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    admin = await AdminGenerator.extension();
  });

  const performQuery = (apolloClient: ApolloServerTestClient) =>
    apolloClient.query({ query: GET_JOB_APPLICATIONS });

  const createJobApplication = async (status: ApprovalStatus) => {
    const jobApplication = await JobApplicationGenerator.instance.updatedWithStatus({
      admin,
      status
    });

    return { jobApplication };
  };

  describe("when the input is valid", () => {
    it("returns all jobApplications", async () => {
      const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
      await createJobApplication(ApprovalStatus.rejected);
      await createJobApplication(ApprovalStatus.pending);
      const { jobApplication } = await createJobApplication(ApprovalStatus.approved);

      const { data } = await apolloClient.query({ query: GET_JOB_APPLICATIONS });

      const applicant = await jobApplication.getApplicant();
      const offer = await jobApplication.getOffer();
      const company = await offer.getCompany();
      const user = await UserRepository.findByUuid(applicant.userUuid);
      expect(data!.getJobApplications.shouldFetchMore).toEqual(false);
      expect(data!.getJobApplications.results).toHaveLength(3);
      expect(data!.getJobApplications.results[0]).toEqual({
        uuid: jobApplication.uuid,
        updatedAt: jobApplication.updatedAt.toISOString(),
        createdAt: jobApplication.createdAt.toISOString(),
        approvalStatus: ApprovalStatus.approved,
        offer: {
          uuid: offer.uuid,
          title: offer.title,
          company: {
            companyName: company.companyName
          }
        },
        applicant: {
          uuid: applicant.uuid,
          user: {
            name: user.name,
            surname: user.surname
          }
        }
      });
    });

    describe("pagination", () => {
      let applicationsByDescUpdatedAt: JobApplication[] = [];
      let apolloClient: ApolloServerTestClient;

      beforeAll(async () => {
        await JobApplicationRepository.truncate();

        const result = await TestClientGenerator.admin({ secretary: Secretary.extension });
        apolloClient = result.apolloClient;

        for (const _ of range(15)) {
          applicationsByDescUpdatedAt.push(
            await JobApplicationGenerator.instance.updatedWithStatus({
              admin,
              status: ApprovalStatus.approved
            })
          );
        }

        applicationsByDescUpdatedAt = applicationsByDescUpdatedAt.sort(
          application => -application.updatedAt
        );
      });

      it("gets the latest 10 applications", async () => {
        const itemsPerPage = 10;
        mockItemsPerPage(itemsPerPage);
        const { data } = await performQuery(apolloClient);
        expect(
          data!.getJobApplications.results.map(application => application.applicant.uuid)
        ).toEqual(
          applicationsByDescUpdatedAt
            .slice(0, itemsPerPage)
            .map(application => application.applicantUuid)
        );
        expect(data!.getJobApplications.shouldFetchMore).toEqual(true);
      });

      it("gets the next 3 applications", async () => {
        const itemsPerPage = 3;
        const lastApplicationIndex = 10;
        mockItemsPerPage(itemsPerPage);
        const lastApplication = applicationsByDescUpdatedAt[lastApplicationIndex - 1];
        const { data } = await apolloClient.query({
          query: GET_JOB_APPLICATIONS,
          variables: {
            updatedBeforeThan: {
              dateTime: lastApplication.updatedAt.toISOString(),
              uuid: lastApplication.uuid
            }
          }
        });
        expect(
          data!.getJobApplications.results.map(application => application.applicant.uuid)
        ).toEqual(
          applicationsByDescUpdatedAt
            .slice(lastApplicationIndex, lastApplicationIndex + itemsPerPage)
            .map(application => application.applicantUuid)
        );
        expect(data!.getJobApplications.shouldFetchMore).toEqual(true);
      });
    });

    describe("Errors", () => {
      it("returns an error if there is no current user", async () => {
        const apolloClient = client.loggedOut();
        const { errors } = await performQuery(apolloClient);

        expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
      });

      it("returns an error if current user is not an admin", async () => {
        const { apolloClient } = await TestClientGenerator.user();
        const { errors } = await performQuery(apolloClient);

        expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
      });

      it("returns an error if current user is a company user", async () => {
        const { apolloClient } = await TestClientGenerator.company();
        const { errors } = await performQuery(apolloClient);

        expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
      });

      it("returns an error if current user is an applicant", async () => {
        const { apolloClient } = await TestClientGenerator.company();
        const { errors } = await performQuery(apolloClient);

        expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
      });
    });
  });
});
