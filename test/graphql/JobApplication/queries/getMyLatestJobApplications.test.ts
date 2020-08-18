import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { UserRepository } from "$models/User";
import { Admin, Applicant, Company, JobApplication } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CompanyRepository } from "$models/Company";
import { JobApplicationRepository } from "$models/JobApplication";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { OfferGenerator } from "$generators/Offer";
import { AdminGenerator } from "$generators/Admin";
import { ApplicantGenerator } from "$generators/Applicant";
import { TestClientGenerator } from "$generators/TestClient";
import { Secretary } from "$models/Admin";
import { range } from "lodash";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { ApolloServerTestClient } from "apollo-server-testing";

const GET_MY_LATEST_JOB_APPLICATIONS = gql`
  query getMyLatestJobApplications($updatedBeforeThan: PaginatedJobApplicationsInput) {
    getMyLatestJobApplications(updatedBeforeThan: $updatedBeforeThan) {
      shouldFetchMore
      results {
        updatedAt
        offer {
          uuid
          title
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

describe("getMyLatestJobApplications", () => {
  let applicant: Applicant;
  let admin: Admin;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    applicant = await ApplicantGenerator.instance.withMinimumData();
    admin = await AdminGenerator.instance({ secretary: Secretary.extension });
  });

  describe("when the input is valid", () => {
    it("returns all my company jobApplications", async () => {
      const { apolloClient, company } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
      const jobApplication = await JobApplicationRepository.apply(applicant.uuid, offer);

      const { data } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS
      });

      const user = await applicant.getUser();
      expect(data!.getMyLatestJobApplications.shouldFetchMore).toEqual(false);
      expect(data!.getMyLatestJobApplications.results).toMatchObject([
        {
          updatedAt: jobApplication.updatedAt.toISOString(),
          offer: {
            uuid: offer.uuid,
            title: offer.title
          },
          applicant: {
            uuid: applicant.uuid,
            user: {
              name: user.name,
              surname: user.surname
            }
          }
        }
      ]);
    });
  });

  describe("pagination", () => {
    let applicationsByDescUpdatedAt: JobApplication[] = [];
    let apolloClient: ApolloServerTestClient;
    let company: Company;

    beforeAll(async () => {
      await JobApplicationRepository.truncate();

      const result = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      apolloClient = result.apolloClient;
      company = result.company;

      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
      for (const _ of range(15)) {
        applicationsByDescUpdatedAt.push(
          await JobApplicationRepository.apply(
            (await ApplicantGenerator.instance.withMinimumData()).uuid,
            offer
          )
        );
      }

      applicationsByDescUpdatedAt = applicationsByDescUpdatedAt.sort(
        application => -application.updatedAt
      );
    });

    it("gets the latest 10 applications", async () => {
      const itemsPerPage = 10;
      mockItemsPerPage(itemsPerPage);
      const { data } = await apolloClient.query({ query: GET_MY_LATEST_JOB_APPLICATIONS });
      expect(
        data!.getMyLatestJobApplications.results.map(application => application.applicant.uuid)
      ).toEqual(
        applicationsByDescUpdatedAt
          .slice(0, itemsPerPage)
          .map(application => application.applicantUuid)
      );
      expect(data!.getMyLatestJobApplications.shouldFetchMore).toEqual(true);
    });

    it("gets the next 3 applications", async () => {
      const itemsPerPage = 3;
      const lastApplicationIndex = 10;
      mockItemsPerPage(itemsPerPage);
      const lastApplication = applicationsByDescUpdatedAt[lastApplicationIndex - 1];
      const { data } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS,
        variables: {
          updatedBeforeThan: {
            dateTime: lastApplication.updatedAt.toISOString(),
            applicantUuid: lastApplication.applicantUuid,
            offerUuid: lastApplication.offerUuid
          }
        }
      });
      expect(
        data!.getMyLatestJobApplications.results.map(application => application.applicant.uuid)
      ).toEqual(
        applicationsByDescUpdatedAt
          .slice(lastApplicationIndex, lastApplicationIndex + itemsPerPage)
          .map(application => application.applicantUuid)
      );
      expect(data!.getMyLatestJobApplications.shouldFetchMore).toEqual(true);
    });
  });

  describe("Errors", () => {
    it("return an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const { errors } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: AuthenticationError.name
      });
    });

    it("returns an error if current user is not a companyUser", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if the company has pending status", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.pending
        }
      });
      const { errors } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if the company has rejected status", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.rejected
        }
      });
      const { errors } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });
  });
});
