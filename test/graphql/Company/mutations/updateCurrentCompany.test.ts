import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { Admin } from "$models";

import { EmailService } from "$services/Email";
import { CompanyRepository } from "$models/Company";
import { AdminNotificationRepository } from "$models/AdminNotification";
import { UserRepository } from "$models/User";

import { TestClientGenerator } from "$generators/TestClient";
import { AdminGenerator } from "$generators/Admin";
import { UUID_REGEX } from "$test/models";

const UPDATE_CURRENT_COMPANY = gql`
  mutation(
    $companyName: String
    $slogan: String
    $description: String
    $logo: String
    $website: String
    $email: String
    $phoneNumbers: [String]
    $photos: [String]
  ) {
    updateCurrentCompany(
      companyName: $companyName
      slogan: $slogan
      description: $description
      logo: $logo
      website: $website
      email: $email
      phoneNumbers: $phoneNumbers
      photos: $photos
    ) {
      companyName
      slogan
      description
      logo
      website
      email
    }
  }
`;

describe("updateCurrentCompany", () => {
  let admin: Admin;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();

    admin = await AdminGenerator.graduados();
  });

  beforeEach(() => {
    jest.spyOn(EmailService, "send").mockImplementation(jest.fn());
  });

  const performQuery = (apolloClient: TestClient, variables?: object) =>
    apolloClient.mutate({
      mutation: UPDATE_CURRENT_COMPANY,
      variables: variables || {}
    });

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: { approvalStatus, admin } });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: { approvalStatus, admin } });

  it("update all company attributes", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.pending);
    const dataToUpdate = {
      companyName: "Devartis SA",
      slogan: "new slogan",
      description: "new description",
      logo: "",
      website: "http://www.new-site.com",
      email: "old@devartis.com"
    };
    const { data, errors } = await apolloClient.mutate({
      mutation: UPDATE_CURRENT_COMPANY,
      variables: dataToUpdate
    });
    expect(errors).toBeUndefined();
    expect(data!.updateCurrentCompany).toEqual(dataToUpdate);
  });

  it("allows a pending company to update", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient, { companyName: "Devartis SA" });
    expect(errors).toBeUndefined();
  });

  it("allows a rejected company to update", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient, { companyName: "Devartis SA" });
    expect(errors).toBeUndefined();
  });

  it("allows an approved company to update", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.approved);
    const { errors } = await performQuery(apolloClient, { companyName: "Devartis SA" });
    expect(errors).toBeUndefined();
  });

  describe("Notifications", () => {
    beforeEach(() => AdminNotificationRepository.truncate());

    it("creates one notifications for graduados and another one for extension", async () => {
      const { apolloClient } = await createCompanyTestClient(ApprovalStatus.approved);
      await performQuery(apolloClient, { companyName: "Devartis SA" });
      const extensionNotifications = await AdminNotificationRepository.findLatestBySecretary({
        secretary: Secretary.extension
      });
      const graduadosNotifications = await AdminNotificationRepository.findLatestBySecretary({
        secretary: Secretary.graduados
      });

      expect(extensionNotifications.shouldFetchMore).toBe(false);
      expect(extensionNotifications.results).toHaveLength(1);

      expect(graduadosNotifications.shouldFetchMore).toBe(false);
      expect(graduadosNotifications.results).toHaveLength(1);
    });

    it("creates the  notifications with the correct attributes", async () => {
      const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
      await performQuery(apolloClient, { companyName: "Devartis SA" });
      const extensionNotifications = await AdminNotificationRepository.findLatestBySecretary({
        secretary: Secretary.extension
      });
      const graduadosNotifications = await AdminNotificationRepository.findLatestBySecretary({
        secretary: Secretary.graduados
      });
      expect(extensionNotifications.results).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          secretary: Secretary.extension,
          companyUuid: company.uuid,
          isNew: true,
          createdAt: expect.any(Date)
        }
      ]);
      expect(graduadosNotifications.results).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          secretary: Secretary.graduados,
          companyUuid: company.uuid,
          isNew: true,
          createdAt: expect.any(Date)
        }
      ]);
    });
  });

  it("does not update the company if the notifications persistence fails", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const oldCompanyName = company.companyName;
    jest.spyOn(AdminNotificationRepository, "save").mockImplementation(() => {
      throw new Error();
    });
    const { errors } = await performQuery(apolloClient, { companyName: "NEW_NAME" });
    expect(errors).toEqualGraphQLErrorType(Error.name);
    const persistedCompany = await CompanyRepository.findByUuid(company.uuid);
    expect(persistedCompany.companyName).toEqual(oldCompanyName);
  });

  it("throws an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const dataToUpdate = { companyName: "new company name" };
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_CURRENT_COMPANY,
      variables: dataToUpdate
    });

    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("throws an error if current user is not a company user", async () => {
    const { apolloClient } = await TestClientGenerator.user();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_CURRENT_COMPANY,
      variables: {}
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is a approved applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.approved);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an extension admin", async () => {
    const secretary = Secretary.extension;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a graduados admin", async () => {
    const secretary = Secretary.graduados;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
