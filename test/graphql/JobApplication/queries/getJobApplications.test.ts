import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient } from "apollo-server-testing";

import { UserRepository } from "$models/User";
import { Admin, Company, JobApplication } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { JobApplicationRepository } from "$models/JobApplication";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { OfferGenerator } from "$generators/Offer";
import { AdminGenerator } from "$generators/Admin";
import { ApplicantGenerator } from "$generators/Applicant";
import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";

import { range } from "lodash";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { Secretary } from "$src/models/Admin";

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
    const company = await CompanyGenerator.instance.withCompleteData();
    const applicant = await ApplicantGenerator.instance.student();
    const offer = await OfferGenerator.instance.forStudents({ companyUuid: company.uuid });
    const { uuid } = await JobApplicationRepository.apply(applicant, offer);
    const jobApplication = await JobApplicationRepository.updateApprovalStatus({
      uuid,
      admin,
      status
    });
    return { jobApplication, offer, applicant, company };
  };

  describe("when the input is valid", () => {
    it("returns all jobApplications", async () => {
      const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
      await createJobApplication(ApprovalStatus.rejected);
      await createJobApplication(ApprovalStatus.pending);
      const { jobApplication, offer, applicant, company } = await createJobApplication(
        ApprovalStatus.approved
      );

      const { data } = await apolloClient.query({ query: GET_JOB_APPLICATIONS });

      const user = await applicant.getUser();
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
      let company: Company;

      beforeAll(async () => {
        await JobApplicationRepository.truncate();

        const result = await TestClientGenerator.admin({ secretary: Secretary.extension });
        apolloClient = result.apolloClient;
        company = await CompanyGenerator.instance.withCompleteData();

        const offer = await OfferGenerator.instance.forStudents({ companyUuid: company.uuid });
        for (const _ of range(15)) {
          const studentAndGraduate = await ApplicantGenerator.instance.studentAndGraduate();
          const { uuid } = await JobApplicationRepository.apply(studentAndGraduate, offer);
          applicationsByDescUpdatedAt.push(
            await JobApplicationRepository.updateApprovalStatus({
              uuid,
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
      it("return an error if there is no current user", async () => {
        const apolloClient = client.loggedOut();
        const { errors } = await performQuery(apolloClient);

        expect(errors![0].extensions!.data).toEqual({
          errorType: AuthenticationError.name
        });
      });

      it("returns an error if current user is not an admin", async () => {
        const { apolloClient } = await TestClientGenerator.user();
        const { errors } = await performQuery(apolloClient);

        expect(errors![0].extensions!.data).toEqual({
          errorType: UnauthorizedError.name
        });
      });
    });
  });
});
