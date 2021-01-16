import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { UserRepository } from "$models/User";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";

import { TestClientGenerator } from "$generators/TestClient";
import { ApplicantGenerator } from "$test/generators/Applicant";
import { CareerGenerator } from "$test/generators/Career";
import { CompanyGenerator } from "$test/generators/Company";
import { OfferGenerator } from "$test/generators/Offer";
import { JobApplicationRepository } from "$models/JobApplication";

const GET_STATISTICS = gql`
  query getStatistics {
    getStatistics {
      amountOfStudents
      amountOfGraduates
      amountOfCompanies
      amountOfJobApplications
      amountOfOffers
    }
  }
`;

describe("getStatistics", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const performQuery = (apolloClient: TestClient) => apolloClient.query({ query: GET_STATISTICS });

  it("returns all values in 0 when there is no data", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await performQuery(apolloClient);
    expect(errors).toBeUndefined();
    expect(data!.getStatistics).toEqual({
      amountOfStudents: 0,
      amountOfGraduates: 0,
      amountOfCompanies: 0,
      amountOfJobApplications: 0,
      amountOfOffers: 0
    });
  });

  it("returns the values of each statistic when there is data", async () => {
    const firstCareer = await CareerGenerator.instance();
    const secondCareer = await CareerGenerator.instance();
    const student = await ApplicantGenerator.instance.student({ career: firstCareer });
    const graduate = await ApplicantGenerator.instance.graduate({ career: firstCareer });
    const studentAndGraduate = await ApplicantGenerator.instance.studentAndGraduate({
      finishedCareer: firstCareer,
      careerInProgress: secondCareer
    });
    const company = await CompanyGenerator.instance.updatedWithStatus(ApprovalStatus.approved);

    const anotherCompany = await CompanyGenerator.instance.withMinimumData();
    anotherCompany.set({ companyName: "Despegar" });
    await CompanyRepository.save(anotherCompany);

    const offer1 = await OfferGenerator.instance.forStudents({ companyUuid: company.uuid });
    const offer2 = await OfferGenerator.instance.forGraduates({ companyUuid: company.uuid });
    const offer3 = await OfferGenerator.instance.forStudentsAndGraduates({
      companyUuid: anotherCompany.uuid
    });

    const firstJobApplication = studentAndGraduate.applyTo(offer1);
    const secondJobApplication = graduate.applyTo(offer2);
    const thirdJobApplication = student.applyTo(offer3);
    firstJobApplication.setAttributes({ approvalStatus: ApprovalStatus.approved });
    secondJobApplication.setAttributes({ approvalStatus: ApprovalStatus.approved });
    await JobApplicationRepository.save(firstJobApplication);
    await JobApplicationRepository.save(secondJobApplication);
    await JobApplicationRepository.save(thirdJobApplication);

    const { apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await performQuery(apolloClient);
    expect(errors).toBeUndefined();
    expect(data!.getStatistics).toEqual({
      amountOfStudents: 2,
      amountOfGraduates: 2,
      amountOfCompanies: 1,
      amountOfJobApplications: 2,
      amountOfOffers: 3
    });
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.pending });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from an approved company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.approved });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.rejected });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an approved applicant", async () => {
    const status = ApprovalStatus.approved;
    const { apolloClient } = await TestClientGenerator.applicant({ status });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const status = ApprovalStatus.rejected;
    const { apolloClient } = await TestClientGenerator.applicant({ status });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const status = ApprovalStatus.pending;
    const { apolloClient } = await TestClientGenerator.applicant({ status });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
