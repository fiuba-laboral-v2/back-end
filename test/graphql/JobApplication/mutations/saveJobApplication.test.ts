import { ApolloError, gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { OfferGenerator } from "$generators/Offer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";
import generateUuid from "uuid/v4";
import { Secretary } from "$models/Admin";
import { UUID_REGEX } from "$test/models";

const SAVE_JOB_APPLICATION = gql`
  mutation saveJobApplication($offerUuid: String!) {
    saveJobApplication(offerUuid: $offerUuid) {
      uuid
      offerUuid
      applicantUuid
    }
  }
`;

describe("saveJobApplication", () => {
  let company;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    company = await CompanyGenerator.instance.withCompleteData();
  });

  describe("when the input is valid", () => {
    it("should create a new job application", async () => {
      const { applicant, apolloClient } = await TestClientGenerator.applicant({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await AdminGenerator.instance({ secretary: Secretary.extension })
        }
      });
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });

      const { data, errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });

      expect(errors).toBeUndefined();
      expect(data!.saveJobApplication).toEqual({
        uuid: expect.stringMatching(UUID_REGEX),
        offerUuid: offer.uuid,
        applicantUuid: applicant.uuid
      });
    });
  });

  describe("Errors", () => {
    it("returns an error if no offerUuid is provided", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION
      });
      expect(errors![0].constructor.name).toEqual(ApolloError.name);
    });

    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });

      expect(errors![0].extensions!.data).toEqual({
        errorType: AuthenticationError.name
      });
    });

    it("returns an error if current user is not an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if current user is a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if current user is an admin", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if current user is a pending applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if current user is a rejected applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: {
          approvalStatus: ApprovalStatus.rejected,
          admin: await AdminGenerator.instance({ secretary: Secretary.extension })
        }
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: generateUuid() }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if the application already exist", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await AdminGenerator.instance({ secretary: Secretary.extension })
        }
      });
      const offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
      await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });

      expect(errors![0].extensions!.data).toMatchObject({
        errorType: "JobApplicationAlreadyExistsError"
      });
    });

    it("returns an error if the offer does not exist", async () => {
      const { apolloClient } = await TestClientGenerator.applicant({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await AdminGenerator.instance({ secretary: Secretary.extension })
        }
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da" }
      });

      expect(errors![0].extensions!.data).toMatchObject({
        errorType: "OfferNotFound"
      });
    });
  });
});
