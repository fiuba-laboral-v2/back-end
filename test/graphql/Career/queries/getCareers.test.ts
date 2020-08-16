import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { CareerRepository } from "$models/Career";
import { UserRepository } from "$models/User";
import { CareerGenerator } from "$generators/Career";
import { TestClientGenerator } from "$generators/TestClient";

const GET_CAREERS = gql`
    query getCareers {
        getCareers {
            code
            description
        }
    }
`;

describe("getCareers", () => {
  beforeAll(async () => {
    await CareerRepository.truncate();
    await UserRepository.truncate();
  });

  it("gets all careers using the code", async () => {
    const { apolloClient } = await TestClientGenerator.user();
    const career = await CareerRepository.create(CareerGenerator.data());

    const { data, errors } = await apolloClient.query({ query: GET_CAREERS });
    expect(errors).toBeUndefined();
    expect(data!.getCareers).toMatchObject(
      [
        {
          code: career.code,
          description: career.description
        }
      ]
    );
  });

  it("works if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await apolloClient.query({ query: GET_CAREERS });
    expect(errors).toBeUndefined();
  });
});
