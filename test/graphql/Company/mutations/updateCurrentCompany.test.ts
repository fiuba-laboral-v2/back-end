import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { IUpdateCurrentCompany } from "$graphql/Company/Mutations/updateCurrentCompany";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { EmailService } from "$services/Email";
import { CompanyRepository } from "$models/Company";
import { AdminNotificationRepository } from "$models/AdminNotification";
import { UserRepository } from "$models/User";

import { TestClientGenerator } from "$generators/TestClient";
import { UUID_REGEX } from "$test/models";

const UPDATE_CURRENT_COMPANY = gql`
  mutation(
    $companyName: String!
    $businessSector: String!
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
      businessSector: $businessSector
      slogan: $slogan
      description: $description
      logo: $logo
      website: $website
      email: $email
      phoneNumbers: $phoneNumbers
      photos: $photos
    ) {
      companyName
      businessSector
      slogan
      description
      logo
      website
      email
      photos
    }
  }
`;

describe("updateCurrentCompany", () => {
  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  beforeEach(() => {
    jest.spyOn(EmailService, "send").mockImplementation(jest.fn());
  });

  const mandatoryVariables = {
    companyName: "Devartis SA",
    businessSector: "newBusinessSector"
  };

  const performQuery = (apolloClient: TestClient, variables?: IUpdateCurrentCompany) =>
    apolloClient.mutate({
      mutation: UPDATE_CURRENT_COMPANY,
      variables: variables || {}
    });

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: approvalStatus });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: approvalStatus });

  it("update all company attributes", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.pending);
    const dataToUpdate = {
      ...mandatoryVariables,
      slogan: "new slogan",
      description: "new description",
      logo: "",
      website: "http://www.new-site.com",
      email: "old@devartis.com",
      photos: [
        "https://i.scdn.co/image/ab67616d0000b2730f688fa11af022f0210e21cb",
        "https://i.scdn.co/image/ab67616d0000b273cac78df6ec3c73e118a308e0",
        "https://i.scdn.co/image/ab67616d0000b2735084c69ed3f70e8fb139e1ea"
      ]
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
    const { errors } = await performQuery(apolloClient, mandatoryVariables);
    expect(errors).toBeUndefined();
  });

  it("allows a rejected company to update", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient, mandatoryVariables);
    expect(errors).toBeUndefined();
  });

  it("allows an approved company to update", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.approved);
    const { errors } = await performQuery(apolloClient, mandatoryVariables);
    expect(errors).toBeUndefined();
  });

  it("moves back to pending if the company was rejected", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient, mandatoryVariables);
    expect(errors).toBeUndefined();
    const updatedCompany = await CompanyRepository.findByUuid(company.uuid);
    expect(updatedCompany.approvalStatus).toEqual(ApprovalStatus.pending);
  });

  it("does not update the approval status if the company was approved", async () => {
    const status = ApprovalStatus.approved;
    const { apolloClient, company } = await createCompanyTestClient(status);
    const { errors } = await performQuery(apolloClient, mandatoryVariables);
    expect(errors).toBeUndefined();
    const updatedCompany = await CompanyRepository.findByUuid(company.uuid);
    expect(updatedCompany.approvalStatus).toEqual(status);
  });

  it("does not update the approval status if the company was pending", async () => {
    const status = ApprovalStatus.pending;
    const { apolloClient, company } = await createCompanyTestClient(status);
    const { errors } = await performQuery(apolloClient, mandatoryVariables);
    expect(errors).toBeUndefined();
    const updatedCompany = await CompanyRepository.findByUuid(company.uuid);
    expect(updatedCompany.approvalStatus).toEqual(status);
  });

  describe("Notifications", () => {
    beforeEach(() => AdminNotificationRepository.truncate());

    it("creates one notifications for graduados and another one for extension", async () => {
      const { apolloClient } = await createCompanyTestClient(ApprovalStatus.approved);
      await performQuery(apolloClient, mandatoryVariables);
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
      await performQuery(apolloClient, mandatoryVariables);
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
    const { errors } = await performQuery(apolloClient, mandatoryVariables);
    expect(errors).toEqualGraphQLErrorType(Error.name);
    const persistedCompany = await CompanyRepository.findByUuid(company.uuid);
    expect(persistedCompany.companyName).toEqual(oldCompanyName);
  });

  it("throws an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_CURRENT_COMPANY,
      variables: mandatoryVariables
    });

    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("throws an error if current user is not a company user", async () => {
    const { apolloClient } = await TestClientGenerator.user();
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_CURRENT_COMPANY,
      variables: mandatoryVariables
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, mandatoryVariables);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is a approved applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.approved);
    const { errors } = await performQuery(apolloClient, mandatoryVariables);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient, mandatoryVariables);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient, mandatoryVariables);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an extension admin", async () => {
    const secretary = Secretary.extension;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performQuery(apolloClient, mandatoryVariables);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a graduados admin", async () => {
    const secretary = Secretary.graduados;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performQuery(apolloClient, mandatoryVariables);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
