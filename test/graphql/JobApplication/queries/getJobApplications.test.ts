import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient } from "apollo-server-testing";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { User, UserRepository } from "$models/User";
import { Admin, Applicant, Company, JobApplication, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$src/models/Admin";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { IFindLatest, JobApplicationRepository } from "$models/JobApplication";
import { range } from "lodash";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { JobApplicationGenerator } from "$test/generators/JobApplication";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { ApplicantGenerator } from "$generators/Applicant";
import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";

const GET_JOB_APPLICATIONS = gql`
  query getJobApplications(
    $updatedBeforeThan: PaginatedInput
    $companyName: String
    $applicantName: String
    $offerTitle: String
  ) {
    getJobApplications(
      updatedBeforeThan: $updatedBeforeThan
      companyName: $companyName
      applicantName: $applicantName
      offerTitle: $offerTitle
    ) {
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
  let company: Company;
  let anotherCompany: Company;
  let applicant: Applicant;
  let offer1: Offer;
  let offer2: Offer;
  let offer3: Offer;
  let firstJobApplication: JobApplication;
  let secondJobApplication: JobApplication;
  let thirdJobApplication: JobApplication;
  let user: User;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    admin = await AdminGenerator.extension();
    applicant = await ApplicantGenerator.instance.studentAndGraduate();
    company = await CompanyGenerator.instance.withMinimumData();
    anotherCompany = await CompanyGenerator.instance.withMinimumData();
    anotherCompany.set({ companyName: "Despegar" });
    await CompanyRepository.save(anotherCompany);

    offer1 = await OfferGenerator.instance.forStudents({ companyUuid: company.uuid });
    offer2 = await OfferGenerator.instance.forGraduates({ companyUuid: company.uuid });
    offer3 = await OfferGenerator.instance.forStudentsAndGraduates({
      companyUuid: anotherCompany.uuid
    });

    firstJobApplication = applicant.applyTo(offer1);
    secondJobApplication = applicant.applyTo(offer2);
    thirdJobApplication = applicant.applyTo(offer3);

    await JobApplicationRepository.save(firstJobApplication);
    await JobApplicationRepository.save(secondJobApplication);
    await JobApplicationRepository.save(thirdJobApplication);

    user = await UserRepository.findByUuid(applicant.userUuid);
  });

  const performQuery = (apolloClient: ApolloServerTestClient, variables?: IFindLatest) =>
    apolloClient.query({ query: GET_JOB_APPLICATIONS, variables });

  it("returns all jobApplications", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { data } = await performQuery(apolloClient);
    expect(data!.getJobApplications.shouldFetchMore).toEqual(false);
    expect(data!.getJobApplications.results.map(({ uuid }) => uuid)).toEqual([
      thirdJobApplication.uuid,
      secondJobApplication.uuid,
      firstJobApplication.uuid
    ]);
  });

  it("returns jobApplications by companyName", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { data } = await performQuery(apolloClient, { companyName: company.companyName });
    expect(data!.getJobApplications.shouldFetchMore).toEqual(false);
    expect(data!.getJobApplications.results.map(({ uuid }) => uuid)).toEqual([
      secondJobApplication.uuid,
      firstJobApplication.uuid
    ]);
  });

  it("returns jobApplications by offerTitle", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { data } = await performQuery(apolloClient, { offerTitle: offer3.title });
    expect(data!.getJobApplications.shouldFetchMore).toEqual(false);
    expect(data!.getJobApplications.results.map(({ uuid }) => uuid)).toEqual([
      thirdJobApplication.uuid
    ]);
  });

  it("returns jobApplications by applicantName", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { data } = await performQuery(apolloClient, {
      applicantName: `${user.name} ${user.surname}`
    });
    expect(data!.getJobApplications.shouldFetchMore).toEqual(false);
    expect(data!.getJobApplications.results.map(({ uuid }) => uuid)).toEqual([
      thirdJobApplication.uuid,
      secondJobApplication.uuid,
      firstJobApplication.uuid
    ]);
  });

  it("returns jobApplications by companyName, offerTitle and applicantName", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { data } = await performQuery(apolloClient, {
      companyName: anotherCompany.companyName,
      offerTitle: offer3.title,
      applicantName: `${user.name} ${user.surname}`
    });
    expect(data!.getJobApplications.shouldFetchMore).toEqual(false);
    expect(data!.getJobApplications.results.map(({ uuid }) => uuid)).toEqual([
      thirdJobApplication.uuid
    ]);
  });

  it("returns an empty array if there is no no jobApplications with the given filter", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { data } = await performQuery(apolloClient, {
      companyName: anotherCompany.companyName,
      offerTitle: offer1.title,
      applicantName: `${user.name} ${user.surname}`
    });
    expect(data!.getJobApplications.shouldFetchMore).toEqual(false);
    expect(data!.getJobApplications.results.map(({ uuid }) => uuid)).toEqual([]);
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

    it("returns an error if current user is from a pending company user", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: ApprovalStatus.pending
      });
      const { errors } = await performQuery(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is from an approved company user", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: ApprovalStatus.approved
      });
      const { errors } = await performQuery(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is from a rejected company user", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: ApprovalStatus.rejected
      });
      const { errors } = await performQuery(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is a pending applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: ApprovalStatus.pending
      });
      const { errors } = await performQuery(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is an approved applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: ApprovalStatus.approved
      });
      const { errors } = await performQuery(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is a rejected applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: ApprovalStatus.rejected
      });
      const { errors } = await performQuery(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
