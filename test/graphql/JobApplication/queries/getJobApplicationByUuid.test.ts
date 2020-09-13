import { gql } from "apollo-server";
import { ApolloServerTestClient } from "apollo-server-testing";
import { client } from "../../ApolloTestClient";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { JobApplicationNotFoundError } from "$models/JobApplication";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { TestClientGenerator } from "$generators/TestClient";
import { Constructable } from "$test/types/Constructable";

const GET_JOB_APPLICATION_BY_UUID = gql`
  query getJobApplicationByUuid($uuid: ID!) {
    getJobApplicationByUuid(uuid: $uuid) {
      uuid
      updatedAt
      createdAt
      extensionApprovalStatus
      graduadosApprovalStatus
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

describe("getJobApplicationByUuid", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  describe("when the input is valid", () => {
    it("returns jobApplication by uuid", async () => {
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      const { apolloClient } = await TestClientGenerator.admin();
      const { data } = await apolloClient.query({
        query: GET_JOB_APPLICATION_BY_UUID,
        variables: { uuid: jobApplication.uuid }
      });

      const offer = await jobApplication.getOffer();
      const applicant = await jobApplication.getApplicant();
      const user = await applicant.getUser();
      expect(data!.getJobApplicationByUuid).toEqual({
        uuid: jobApplication.uuid,
        updatedAt: jobApplication.updatedAt.toISOString(),
        createdAt: jobApplication.createdAt.toISOString(),
        extensionApprovalStatus: jobApplication.extensionApprovalStatus,
        graduadosApprovalStatus: jobApplication.graduadosApprovalStatus,
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
      });
    });
  });

  it("returns an error if the jobApplication does not exists", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await apolloClient.query({
      query: GET_JOB_APPLICATION_BY_UUID,
      variables: { uuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da" }
    });

    expect(errors![0].extensions!.data).toEqual({
      errorType: JobApplicationNotFoundError.name
    });
  });

  describe("only an admin can access this query", () => {
    const expectToReturnError = async ({
      apolloClient,
      error
    }: {
      apolloClient: ApolloServerTestClient;
      error: Constructable;
    }) => {
      const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
      const { errors } = await apolloClient.query({
        query: GET_JOB_APPLICATION_BY_UUID,
        variables: { uuid }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: error.name
      });
    };

    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      await expectToReturnError({ apolloClient, error: AuthenticationError });
    });

    it("returns an error if the user is an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      await expectToReturnError({ apolloClient, error: UnauthorizedError });
    });

    it("returns an error if the user is from a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      await expectToReturnError({ apolloClient, error: UnauthorizedError });
    });
  });
});
