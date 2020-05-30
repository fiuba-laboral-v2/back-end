import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { Career, CareerRepository } from "../../../../src/models/Career";
import { CareerGenerator, TCareerDataGenerator } from "../../../generators/Career";
import { testClientFactory } from "../../../mocks/testClientFactory";

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
  let careersData: TCareerDataGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CareerRepository.truncate();
    careersData = CareerGenerator.data();
  });

  afterAll(() => Database.close());

  it("gets all careers using the code", async () => {
    const { apolloClient } = await testClientFactory.user();
    const career = await CareerRepository.create(careersData.next().value);

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

  it("works if there is no current user", async () => {
    const apolloClient = client.loggedOut;
    const { errors } = await apolloClient.query({ query: GET_CAREERS });
    expect(errors).toBeUndefined();
  });
});
