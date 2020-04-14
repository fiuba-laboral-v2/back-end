import { ApolloError, gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { UserRepository } from "../../../../src/models/User/Repository";
import { ApplicantRepository } from "../../../../src/models/Applicant";
import { CompanyRepository } from "../../../../src/models/Company";
import { OfferRepository } from "../../../../src/models/Offer";


import { OfferMocks } from "../../../models/Offer/mocks";
import { companyMockData } from "../../../models/Company/mocks";
import { applicantMocks } from "../../../models/Applicant/mocks";

const SAVE_JOB_APPLICATION = gql`
  mutation saveJobApplication($offerUuid: String!, $applicantUuid: String!) {
    saveJobApplication(offerUuid: $offerUuid, applicantUuid: $applicantUuid) {
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

  describe("when the input is valid", () => {
    it("creates a new job application", async () => {
      const applicant = await ApplicantRepository.create(applicantMocks.applicantData([]));
      const company = await CompanyRepository.create(companyMockData);
      const offer = await OfferRepository.create(OfferMocks.completeData(company.id));
      const {
        data: { saveJobApplication },
        errors
      } = await executeMutation(SAVE_JOB_APPLICATION, {
        offerUuid: offer.uuid,
        applicantUuid: applicant.uuid
      });
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

  describe("when the input values are invalid", () => {
    it("should return an error if no offerUuid is provided", async () => {
      const { errors } = await executeMutation(SAVE_JOB_APPLICATION, {
        applicantUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
      });
      expect(errors[0]).toEqual(
        new ApolloError(`Variable "$offerUuid" of required type "String!" was not provided.`)
      );
    });

    it("should return an error if no applicantUuid is provided", async () => {
      const { errors } = await executeMutation(SAVE_JOB_APPLICATION, {
        offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
      });
      expect(errors[0]).toEqual(
        new ApolloError(`Variable "$applicantUuid" of required type "String!" was not provided.`)
      );
    });
  });
});
