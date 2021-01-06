import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { ApplicantRepository, ApplicantType, IFindLatest } from "$models/Applicant";
import { CareerRepository } from "$models/Career";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Career } from "$models";

import { CareerGenerator } from "$generators/Career";
import { TestClientGenerator } from "$generators/TestClient";
import { ApplicantGenerator } from "$generators/Applicant";
import { mockItemsPerPage } from "$test/mocks/config/PaginationConfig";

const GET_APPLICANTS = gql`
  query GetApplicants(
    $updatedBeforeThan: PaginatedInput
    $careerCodes: [String]
    $applicantType: ApplicantType
    $name: String
  ) {
    getApplicants(
      updatedBeforeThan: $updatedBeforeThan
      careerCodes: $careerCodes
      applicantType: $applicantType
      name: $name
    ) {
      shouldFetchMore
      results {
        uuid
      }
    }
  }
`;

describe("getApplicants", () => {
  let firstCareer: Career;
  let secondCareer: Career;

  beforeAll(async () => {
    await CareerRepository.truncate();
    await UserRepository.truncate();
    await CompanyRepository.truncate();

    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();
  });

  const getApplicants = (apolloClient: TestClient, variables?: IFindLatest) =>
    apolloClient.query({ query: GET_APPLICANTS, variables });

  it("returns an empty array if no applicants are persisted", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await getApplicants(apolloClient);
    expect(errors).toBeUndefined();
    expect(data!.getApplicants.shouldFetchMore).toEqual(false);
    expect(data!.getApplicants.results).toEqual([]);
  });

  it("returns all applicants", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const applicant = await ApplicantGenerator.instance.student({ career: firstCareer });
    const { data, errors } = await getApplicants(apolloClient);
    expect(errors).toBeUndefined();
    expect(data!.getApplicants.shouldFetchMore).toEqual(false);
    expect(data!.getApplicants.results.map(({ uuid }) => uuid)).toEqual([applicant.uuid]);
  });

  it("returns applicants in the first and second career", async () => {
    ApplicantRepository.truncate();
    const { apolloClient } = await TestClientGenerator.admin();
    const student = await ApplicantGenerator.instance.student({ career: firstCareer });
    const graduate = await ApplicantGenerator.instance.graduate({ career: secondCareer });

    const { data, errors } = await getApplicants(apolloClient, {
      careerCodes: [firstCareer.code, secondCareer.code]
    });
    expect(errors).toBeUndefined();
    expect(data!.getApplicants.shouldFetchMore).toEqual(false);
    expect(data!.getApplicants.results.map(({ uuid }) => uuid)).toEqual([
      graduate.uuid,
      student.uuid
    ]);
  });

  it("returns graduates", async () => {
    ApplicantRepository.truncate();
    const { apolloClient } = await TestClientGenerator.admin();
    await ApplicantGenerator.instance.student({ career: firstCareer });
    const graduate = await ApplicantGenerator.instance.graduate({ career: secondCareer });

    const { data, errors } = await getApplicants(apolloClient, {
      applicantType: ApplicantType.graduate
    });
    expect(errors).toBeUndefined();
    expect(data!.getApplicants.shouldFetchMore).toEqual(false);
    expect(data!.getApplicants.results.map(({ uuid }) => uuid)).toEqual([graduate.uuid]);
  });

  it("returns the next two Applicants and shouldFetchMore should be true", async () => {
    const itemsPerPage = 2;
    mockItemsPerPage(itemsPerPage);
    const { apolloClient } = await TestClientGenerator.admin();
    await ApplicantGenerator.instance.student();
    await ApplicantGenerator.instance.graduate();
    await ApplicantGenerator.instance.studentAndGraduate();

    const { data, errors } = await getApplicants(apolloClient);
    expect(errors).toBeUndefined();
    expect(data!.getApplicants.shouldFetchMore).toBe(true);
    expect(data!.getApplicants.results.length).toEqual(2);
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();

      const { errors } = await getApplicants(apolloClient);
      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if current user is an approved applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: ApprovalStatus.approved
      });
      const { errors } = await getApplicants(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is pending applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { errors } = await getApplicants(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is rejected applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: ApprovalStatus.rejected
      });
      const { errors } = await getApplicants(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is from a pending company", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: ApprovalStatus.pending
      });
      const { errors } = await getApplicants(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is from an approved company", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: ApprovalStatus.approved
      });
      const { errors } = await getApplicants(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is from an rejected company", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: ApprovalStatus.rejected
      });
      const { errors } = await getApplicants(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
