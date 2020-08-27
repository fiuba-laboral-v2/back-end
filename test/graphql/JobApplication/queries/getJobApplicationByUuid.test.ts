import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { JobApplicationNotFoundError } from "$models/JobApplication";

import { AuthenticationError } from "$graphql/Errors";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { TestClientGenerator } from "$generators/TestClient";

const GET_JOB_APPLICATION_BY_UUID = gql`
  query getJobApplicationByUuid($uuid: ID!) {
    getJobApplicationByUuid(uuid: $uuid) {
      uuid
      updatedAt
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
  });

  describe("when the input is valid", () => {
    it("returns jobApplication by uuid", async () => {
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      const { apolloClient } = await TestClientGenerator.company();
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
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await apolloClient.query({
      query: GET_JOB_APPLICATION_BY_UUID,
      variables: { uuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da" }
    });

    expect(errors![0].extensions!.data).toEqual({
      errorType: JobApplicationNotFoundError.name
    });
  });

  it("returns an error if there is no current user", async () => {
    const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
    const apolloClient = client.loggedOut();
    const { errors } = await apolloClient.query({
      query: GET_JOB_APPLICATION_BY_UUID,
      variables: { uuid }
    });

    expect(errors![0].extensions!.data).toEqual({
      errorType: AuthenticationError.name
    });
  });
});
