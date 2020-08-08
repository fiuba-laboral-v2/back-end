import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { UserRepository } from "$models/User";
import { Admin, Applicant } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CompanyRepository } from "$models/Company";
import { JobApplicationRepository } from "$models/JobApplication";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { OfferGenerator, TOfferGenerator } from "$generators/Offer";
import { ExtensionAdminGenerator } from "$generators/Admin";
import { ApplicantGenerator } from "$generators/Applicant";
import { TestClientGenerator } from "$generators/TestClient";

const GET_MY_LATEST_JOB_APPLICATIONS = gql`
    query getMyLatestJobApplications {
        getMyLatestJobApplications {
            createdAt
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

describe("getMyLatestJobApplications", () => {
  let applicant: Applicant;
  let offers: TOfferGenerator;
  let admin: Admin;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    applicant = await ApplicantGenerator.instance.withMinimumData();
    offers = await OfferGenerator.instance.withObligatoryData();
    admin = await ExtensionAdminGenerator.instance();
  });

  describe("when the input is valid", () => {
    it("returns all my company jobApplications", async () => {
      const { apolloClient, company } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      const offer = await offers.next({ companyUuid: company.uuid }).value;
      const jobApplication = await JobApplicationRepository.apply(applicant.uuid, offer);

      const { data, errors } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS
      });

      const user = await applicant.getUser();
      expect(errors).toBeUndefined();
      expect(data!.getMyLatestJobApplications).toMatchObject(
        [
          {
            createdAt: jobApplication.createdAt.toISOString(),
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
    it("return an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const { errors } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("returns an error if current user is not a companyUser", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if the company has pending status", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.pending
        }
      });
      const { errors } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if the company has rejected status", async () => {
      const { apolloClient } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.rejected
        }
      });
      const { errors } = await apolloClient.query({
        query: GET_MY_LATEST_JOB_APPLICATIONS
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});
