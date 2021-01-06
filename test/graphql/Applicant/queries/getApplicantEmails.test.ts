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

const GET_APPLICANT_EMAILS = gql`
  query GetApplicantEmails($careerCodes: [String], $applicantType: ApplicantType, $name: String) {
    getApplicantEmails(careerCodes: $careerCodes, applicantType: $applicantType, name: $name)
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

  const getApplicantEmails = (apolloClient: TestClient, variables?: IFindLatest) =>
    apolloClient.query({ query: GET_APPLICANT_EMAILS, variables });

  it("returns an empty array if no applicants are persisted", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await getApplicantEmails(apolloClient);
    expect(errors).toBeUndefined();
    expect(data!.getApplicantEmails).toEqual([]);
  });

  it("returns emails from the applicants in the first and second career", async () => {
    ApplicantRepository.truncate();
    const { apolloClient } = await TestClientGenerator.admin();
    const student = await ApplicantGenerator.instance.student({ career: firstCareer });
    const graduate = await ApplicantGenerator.instance.graduate({ career: secondCareer });
    const graduateUser = await UserRepository.findByUuid(graduate.userUuid);
    const studentUser = await UserRepository.findByUuid(student.userUuid);

    const { data, errors } = await getApplicantEmails(apolloClient, {
      careerCodes: [firstCareer.code, secondCareer.code]
    });
    expect(errors).toBeUndefined();
    expect(data!.getApplicantEmails).toEqual([graduateUser.email, studentUser.email]);
  });

  it("returns emails from graduates", async () => {
    ApplicantRepository.truncate();
    const { apolloClient } = await TestClientGenerator.admin();
    await ApplicantGenerator.instance.student({ career: firstCareer });
    const graduate = await ApplicantGenerator.instance.graduate({ career: secondCareer });
    const graduateUser = await UserRepository.findByUuid(graduate.userUuid);

    const { data, errors } = await getApplicantEmails(apolloClient, {
      applicantType: ApplicantType.graduate
    });
    expect(errors).toBeUndefined();
    expect(data!.getApplicantEmails).toEqual([graduateUser.email]);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();

    const { errors } = await getApplicantEmails(apolloClient);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if current user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.pending
    });
    const { errors } = await getApplicantEmails(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if current user is an approved applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved
    });
    const { errors } = await getApplicantEmails(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if current user is an rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.rejected
    });
    const { errors } = await getApplicantEmails(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if current user is from a pending company", async () => {
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.pending
    });
    const { errors } = await getApplicantEmails(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if current user is from an approved company", async () => {
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
    const { errors } = await getApplicantEmails(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if current user is from an rejected company", async () => {
    const { apolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.rejected
    });
    const { errors } = await getApplicantEmails(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
