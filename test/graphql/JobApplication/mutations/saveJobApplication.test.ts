import { ApolloError, gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { Database } from "../../../../src/config/Database";

import { UserRepository } from "../../../../src/models/User";
import { CompanyRepository } from "../../../../src/models/Company";

import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

import { OfferGenerator, TOfferGenerator } from "../../../generators/Offer";
import { companyMocks } from "../../../models/Company/mocks";
import { testClientFactory } from "../../../mocks/testClientFactory";

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

  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    company = await CompanyRepository.create(companyMocks.companyData());
    offers = await OfferGenerator.instance.withObligatoryData();
  });

  afterAll(() => Database.close());

  describe("when the input is valid", () => {
    it("should create a new job application", async () => {
      const { applicant, apolloClient } = await testClientFactory.applicant();
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
      const offer = await offers.next({ companyUuid: company.uuid }).value;
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if the application already exist", async () => {
      const { apolloClient } = await testClientFactory.applicant();
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
      const { apolloClient } = await testClientFactory.applicant();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da" }
      });

      expect(errors![0].extensions!.data).toMatchObject({ errorType: "OfferNotFound" });
    });
  });
});
