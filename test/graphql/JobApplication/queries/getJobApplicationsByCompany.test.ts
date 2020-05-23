import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { UserRepository } from "../../../../src/models/User";
import { CompanyRepository } from "../../../../src/models/Company";
import { OfferRepository } from "../../../../src/models/Offer";
import { JobApplicationRepository } from "../../../../src/models/JobApplication";

import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

import { OfferMocks } from "../../../models/Offer/mocks";
import { companyMocks } from "../../../models/Company/mocks";
import { loginFactory } from "../../../mocks/login";

const GET_JOB_APPLICATIONS_BY_COMPANY = gql`
    query getJobApplicationsByCompany {
        getJobApplicationsByCompany {
            offer {
                uuid
                title
            }
            applicant {
                uuid
                user {
                    name
                    surname
                }
            }
        }
    }
`;

describe("getJobApplicationsByCompany", () => {
  let company;
  beforeAll(async () => {
    Database.setConnection();
    await Promise.all([
      UserRepository.truncate(),
      CompanyRepository.truncate()
    ]);

    company = await CompanyRepository.create(companyMocks.companyData());
  });

  afterAll(async () => {
    await Promise.all([
      UserRepository.truncate(),
      CompanyRepository.truncate()
    ]);
    Database.close();
  });

  describe("when the input is valid", () => {
    it("returns all my company jobApplications", async () => {
      const { applicant, apolloClient } = await loginFactory.applicant();
      const offer = await OfferRepository.create(OfferMocks.completeData(company.uuid));
      await JobApplicationRepository.apply(applicant.uuid, offer);

      const { data, errors } = await apolloClient.query({
        query: GET_JOB_APPLICATIONS_BY_COMPANY
      });

      const user = await applicant.getUser();
      expect(errors).toBeUndefined();
      expect(data!.getJobApplicationsByCompany).toMatchObject(
        [
          {
            offer: {
              uuid: offer.uuid,
              title: offer.title
            },
            applicant: {
              uuid: applicant.uuid,
              user: {
                name: user.name,
                surname: user.surname
              }
            }
          }
        ]
      );
    });
  });

  describe("Errors", () => {
    it("should return an error if there is no current user", async () => {
      const apolloClient = client.loggedOut;
      const { errors } = await apolloClient.query({
        query: GET_JOB_APPLICATIONS_BY_COMPANY
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("should return an error if current user is not a companyUser", async () => {
      const { apolloClient } = await loginFactory.user();
      const { errors } = await apolloClient.query({
        query: GET_JOB_APPLICATIONS_BY_COMPANY
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});
