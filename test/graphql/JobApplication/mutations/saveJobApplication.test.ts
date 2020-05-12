import { ApolloError, gql } from "apollo-server";
import { executeMutation, testCurrentUserEmail, client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { UserRepository } from "../../../../src/models/User";
import { ApplicantRepository } from "../../../../src/models/Applicant";
import { CompanyRepository } from "../../../../src/models/Company";
import { OfferRepository } from "../../../../src/models/Offer";

import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

import { OfferMocks } from "../../../models/Offer/mocks";
import { companyMocks } from "../../../models/Company/mocks";
import { applicantMocks } from "../../../models/Applicant/mocks";
import { userFactory } from "../../../mocks/user";

const SAVE_JOB_APPLICATION = gql`
  mutation saveJobApplication($offerUuid: String!) {
    saveJobApplication(offerUuid: $offerUuid) {
        offer {
          uuid
        }
        applicantUuid
    }
  }
`;

describe("saveJobApplication", () => {
  beforeAll(() => Database.setConnection());
  beforeEach(() => Promise.all([
    UserRepository.truncate(),
    CompanyRepository.truncate()
  ]));
  afterAll(() => Database.close());

  const applicantData = {
    ...applicantMocks.applicantData([]),
    user: {
      email: testCurrentUserEmail,
      password: "AValidPassword000",
      name: "name",
      surname: "surname"
    }
  };

  describe("when the input is valid", () => {
    it("should create a new job application", async () => {
      const applicant = await userFactory.applicantUser();
      const user = await applicant.getUser();
      const apolloClient = client.loggedIn({
        uuid: user.uuid,
        email: user.email,
        applicantUuid: applicant.uuid
      });

      const company = await CompanyRepository.create(companyMocks.companyData());
      const offer = await OfferRepository.create(OfferMocks.completeData(company.uuid));

      const { data, errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });

      expect(errors).toBeUndefined();
      expect(data!.saveJobApplication).toMatchObject(
        {
          offer: {
            uuid: offer.uuid
          },
          applicantUuid: applicant.uuid
        }
      );
    });
  });

  describe("Errors", () => {
    it("should return an error if no offerUuid is provided", async () => {
      const { errors } = await executeMutation(SAVE_JOB_APPLICATION);
      expect(errors![0].constructor.name).toEqual(ApolloError.name);
    });

    it("should return an error if there is no current user", async () => {
      const company = await CompanyRepository.create(companyMocks.companyData());
      const offer = await OfferRepository.create(OfferMocks.completeData(company.uuid));
      const { errors } = await executeMutation(
        SAVE_JOB_APPLICATION,
        { offerUuid: offer.uuid },
        { loggedIn: false }
      );
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("should return an error if current user is not an applicant", async () => {
      const user = await userFactory.user();
      const apolloClient = client.loggedIn({
        uuid: user.uuid,
        email: user.email
      });

      const { uuid: companyUuid } = await CompanyRepository.create(companyMocks.companyData());
      const offer = await OfferRepository.create(OfferMocks.completeData(companyUuid));
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_JOB_APPLICATION,
        variables: { offerUuid: offer.uuid }
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("should return an error if the application already exist", async () => {
      const applicant = await userFactory.applicantUser();
      const user = await applicant.getUser();
      const apolloClient = client.loggedIn({
        uuid: user.uuid,
        email: user.email,
        applicantUuid: applicant.uuid
      });

      const company = await CompanyRepository.create(companyMocks.companyData());
      const offer = await OfferRepository.create(OfferMocks.completeData(company.uuid));
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

    it("should return an error if the offer does not exist", async () => {
      await ApplicantRepository.create(applicantData);
      const { errors } = await executeMutation(SAVE_JOB_APPLICATION, {
        offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
      });
      expect(errors![0].extensions!.data).toMatchObject({ errorType: "OfferNotFound" });
    });
  });
});
