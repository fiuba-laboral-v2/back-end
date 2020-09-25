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

const GET_MY_LATEST_JOB_APPLICATIONS = gql`
  query getMyLatestJobApplications($updatedBeforeThan: PaginatedInput) {
    getMyLatestJobApplications(updatedBeforeThan: $updatedBeforeThan) {
      shouldFetchMore
      results {
        uuid
        updatedAt
        createdAt
        approvalStatus
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
  let admin: Admin;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    admin = await AdminGenerator.extension();
  });

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({
      status: {
        admin,
        approvalStatus
      }
    });

  const performQuery = (apolloClient: ApolloServerTestClient) =>
    apolloClient.query({ query: GET_MY_LATEST_JOB_APPLICATIONS });

  const createJobApplication = async (companyUuid: string, status: ApprovalStatus) => {
    const applicant = await ApplicantGenerator.instance.student();
    const offer = await OfferGenerator.instance.forStudents({ companyUuid });
    const { uuid } = await JobApplicationRepository.apply(applicant, offer);
    const jobApplication = await JobApplicationRepository.updateApprovalStatus({
      uuid,
      admin,
      status
    });
    return { jobApplication, offer, applicant };
  };

  describe("when the input is valid", () => {
    it("returns all my company approved jobApplications", async () => {
      const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
      const { jobApplication, offer, applicant } = await createJobApplication(
        company.uuid,
        ApprovalStatus.approved
      );

      const { data } = await apolloClient.query({ query: GET_MY_LATEST_JOB_APPLICATIONS });

      const user = await applicant.getUser();
      expect(data!.getMyLatestJobApplications.shouldFetchMore).toEqual(false);
      expect(data!.getMyLatestJobApplications.results).toEqual([
        {
          uuid: jobApplication.uuid,
          updatedAt: jobApplication.updatedAt.toISOString(),
          createdAt: jobApplication.createdAt.toISOString(),
          approvalStatus: ApprovalStatus.approved,
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

    it("returns only the approved jobApplications", async () => {
      const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
      const { jobApplication } = await createJobApplication(company.uuid, ApprovalStatus.approved);
      await createJobApplication(company.uuid, ApprovalStatus.rejected);
      await createJobApplication(company.uuid, ApprovalStatus.pending);

      const { data } = await performQuery(apolloClient);
      expect(data!.getMyLatestJobApplications.results).toEqual([
        expect.objectContaining({
          uuid: jobApplication.uuid,
          approvalStatus: ApprovalStatus.approved
        })
      ]);
    });
  });

  it("returns only the approved jobApplications from my company", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const anotherCompany = await CompanyGenerator.instance.withCompleteData();
    const { jobApplication: firstJobApplication } = await createJobApplication(
      company.uuid,
      ApprovalStatus.approved
    );
    const { jobApplication: secondJobApplication } = await createJobApplication(
      company.uuid,
      ApprovalStatus.approved
    );
    await createJobApplication(company.uuid, ApprovalStatus.rejected);
    await createJobApplication(company.uuid, ApprovalStatus.pending);

    await createJobApplication(anotherCompany.uuid, ApprovalStatus.pending);
    await createJobApplication(anotherCompany.uuid, ApprovalStatus.approved);
    await createJobApplication(anotherCompany.uuid, ApprovalStatus.rejected);

    const { data } = await performQuery(apolloClient);
    expect(data!.getMyLatestJobApplications.results).toEqual([
      expect.objectContaining({
        uuid: secondJobApplication.uuid,
        approvalStatus: ApprovalStatus.approved
      }),
      expect.objectContaining({
        uuid: firstJobApplication.uuid,
        approvalStatus: ApprovalStatus.approved
      })
    ]);
  });

  describe("pagination", () => {
    let applicationsByDescUpdatedAt: JobApplication[] = [];
    let apolloClient: ApolloServerTestClient;
    let company: Company;

    beforeAll(async () => {
      await JobApplicationRepository.truncate();

      const result = await createCompanyTestClient(ApprovalStatus.approved);
      apolloClient = result.apolloClient;
      company = result.company;

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
            uuid: lastApplication.uuid
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
      const { errors } = await performQuery(apolloClient);

      expect(errors![0].extensions!.data).toEqual({
        errorType: AuthenticationError.name
      });
    });

    it("returns an error if current user is not a companyUser", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await performQuery(apolloClient);

      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if the company has pending status", async () => {
      const { apolloClient } = await createCompanyTestClient(ApprovalStatus.pending);
      const { errors } = await performQuery(apolloClient);

      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if the company has rejected status", async () => {
      const { apolloClient } = await createCompanyTestClient(ApprovalStatus.rejected);
      const { errors } = await performQuery(apolloClient);

      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });
  });
});
