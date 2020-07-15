import { ApolloError, gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { UserRepository } from "../../../../src/models/User";
import { CompanyRepository } from "../../../../src/models/Company";

import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

import { OfferGenerator, TOfferGenerator } from "../../../generators/Offer";
import { companyMocks } from "../../../models/Company/mocks";
import { testClientFactory } from "../../../mocks/testClientFactory";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import { AdminGenerator, TAdminGenerator } from "../../../generators/Admin";
import generateUuid from "uuid/v4";

const SAVE_JOB_APPLICATION = gql`
  mutation saveJobApplication($offerUuid: String!) {
    saveJobApplication(offerUuid: $offerUuid) {
        offerUuid
        applicantUuid
    }
  }
`;

describe("saveJobApplication", () => {
  let company;
  let offers: TOfferGenerator;
  let admins: TAdminGenerator;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    company = await CompanyRepository.create(companyMocks.companyData());
    offers = await OfferGenerator.instance.withObligatoryData();
    admins = AdminGenerator.instance();
  });

  describe("when the input is valid", () => {
    it("should create a new job application", async () => {
      const { applicant, apolloClient } = await testClientFactory.applicant({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await admins.next().value
        }
      });
      const offer = await offers.next({ companyUuid: company.uuid }).value;

      const { data, errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });

      expect(errors).toBeUndefined();
      expect(data!.saveJobApplication).toMatchObject(
        {
          offerUuid: offer.uuid,
          applicantUuid: applicant.uuid
        }
      );
    });
  });

  describe("Errors", () => {
    it("returns an error if no offerUuid is provided", async () => {
      const { apolloClient } = await testClientFactory.user();
      const { errors } = await apolloClient.mutate({ mutation: SAVE_JOB_APPLICATION });
      expect(errors![0].constructor.name).toEqual(ApolloError.name);
    });

    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const offer = await offers.next({ companyUuid: company.uuid }).value;
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("returns an error if current user is not an applicant", async () => {
      const { apolloClient } = await testClientFactory.user();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if current user is a company", async () => {
      const { apolloClient } = await testClientFactory.company();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if current user is an admin", async () => {
      const { apolloClient } = await testClientFactory.admin();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if current user is a pending applicant", async () => {
      const { apolloClient } = await testClientFactory.applicant();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if current user is a rejected applicant", async () => {
      const { apolloClient } = await testClientFactory.applicant({
        status: {
          approvalStatus: ApprovalStatus.rejected,
          admin: await admins.next().value
        }
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if the application already exist", async () => {
      const { apolloClient } = await testClientFactory.applicant({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await admins.next().value
        }
      });
      const offer = await offers.next({ companyUuid: company.uuid }).value;
      await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });

      expect(errors![0].extensions!.data).toMatchObject(
        { errorType: "JobApplicationAlreadyExistsError" }
      );
    });

    it("returns an error if the offer does not exist", async () => {
      const { apolloClient } = await testClientFactory.applicant({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await admins.next().value
        }
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da" }
      });

      expect(errors![0].extensions!.data).toMatchObject({ errorType: "OfferNotFound" });
    });
  });
});
