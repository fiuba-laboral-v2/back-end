import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { Career } from "../../../../src/models/Career";
import { careerMocks } from "../../../models/Career/mocks";
import { testClientFactory } from "../../../mocks/testClientFactory";

import { AuthenticationError } from "../../../../src/graphql/Errors";

const GET_CAREERS = gql`
    query getCareers {
        getCareers {
            code
            description
            credits
        }
    }
`;

describe("getCareers", () => {

  beforeAll(async () => {
    Database.setConnection();
    await Career.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("gets all careers using the code", async () => {
    const { apolloClient } = await testClientFactory.user();
    const career = await CareerRepository.create(careerMocks.careerData());

    const { data, errors } = await apolloClient.query({ query: GET_CAREERS });
    expect(errors).toBeUndefined();
    expect(data!.getCareers).toMatchObject(
      [
        {
          code: career.code,
          credits: career.credits,
          description: career.description
        }
      ]
    );
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut;

      const { errors } = await apolloClient.query({ query: GET_CAREERS });
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });
  });
});
