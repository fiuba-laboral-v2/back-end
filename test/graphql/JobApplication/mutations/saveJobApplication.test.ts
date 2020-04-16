import { ApolloError, gql } from "apollo-server";
import { executeMutation, testCurrentUserEmail } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { UserRepository } from "../../../../src/models/User";
import { ApplicantRepository } from "../../../../src/models/Applicant";
import { CompanyRepository } from "../../../../src/models/Company";
import { OfferRepository } from "../../../../src/models/Offer";


import { OfferMocks } from "../../../models/Offer/mocks";
import { companyMockData } from "../../../models/Company/mocks";
import { applicantMocks } from "../../../models/Applicant/mocks";

const SAVE_JOB_APPLICATION = gql`
  mutation saveJobApplication($offerUuid: String!) {
    saveJobApplication(offerUuid: $offerUuid) {
        offer {
          uuid
        }
        applicant {
          uuid
        }
    }
  }
`;


describe("saveJobApplication", () => {

  beforeAll(() => Database.setConnection());

  beforeEach(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  afterAll(() => Database.close());

  const applicantData = {
    ...applicantMocks.applicantData([]),
    user: { email: testCurrentUserEmail, password: "AValidPassword000" }
  };

  describe("when the input is valid", () => {
    it("should create a new job application", async () => {
      const applicant = await ApplicantRepository.create(applicantData);
      const company = await CompanyRepository.create(companyMockData);
      const offer = await OfferRepository.create(OfferMocks.completeData(company.id));
      const {
        data: { saveJobApplication },
        errors
      } = await executeMutation(SAVE_JOB_APPLICATION, { offerUuid: offer.uuid });
      expect(errors).toBeUndefined();
      expect(saveJobApplication).toMatchObject(
        {
          offer: {
            uuid: offer.uuid
          },
          applicant: {
            uuid: applicant.uuid
          }
        }
      );
    });
  });

  describe("Errors", () => {
    it("should return an error if no offerUuid is provided", async () => {
      const { errors } = await executeMutation(SAVE_JOB_APPLICATION);
      expect(errors[0]).toEqual(
        new ApolloError(`Variable "$offerUuid" of required type "String!" was not provided.`)
      );
    });

    it("should return an error if there is no current user", async () => {
      const company = await CompanyRepository.create(companyMockData);
      const offer = await OfferRepository.create(OfferMocks.completeData(company.id));
      const { errors } = await executeMutation(
        SAVE_JOB_APPLICATION,
        { offerUuid: offer.uuid },
        { loggedIn: false }
      );
      expect(errors[0].message).toEqual("You are not authenticated");
    });

    it("should return an error if current user is not an applicant", async () => {
      await UserRepository.create({ email: testCurrentUserEmail, password: "SomeCoolSecret123" });
      const { id: companyId } = await CompanyRepository.create(companyMockData);
      const offer = await OfferRepository.create(OfferMocks.completeData(companyId));
      const { errors } = await executeMutation(SAVE_JOB_APPLICATION, { offerUuid: offer.uuid });
      expect(errors[0].message).toEqual("You are not an applicant");
    });
  });
});
