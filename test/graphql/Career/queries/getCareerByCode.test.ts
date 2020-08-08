import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { CareerRepository } from "$models/Career";
import { UserRepository } from "$models/User";
import { CareersNotFound } from "$models/Career/Errors/CareersNotFound";
import { CareerGenerator, TCareerGenerator } from "$generators/Career";
import { TestClientGenerator } from "$generators/TestClient";

import { AuthenticationError } from "$graphql/Errors";

const GET_CAREER_BY_CODE = gql`
  query GetCareerByCode($code: ID!) {
    getCareerByCode(code: $code) {
      code
      description
      credits
    }
  }
`;

describe("getCareerByCode", () => {
  let careers: TCareerGenerator;

  beforeAll(async () => {
    await CareerRepository.truncate();
    await UserRepository.truncate();
    careers = CareerGenerator.instance();
  });

  it("gets a career using the code", async () => {
    const { apolloClient } = await TestClientGenerator.user();
    const career = await careers.next().value;

    const { data, errors } = await apolloClient.query({
      query: GET_CAREER_BY_CODE,
      variables: { code: career.code }
    });
    expect(errors).toBeUndefined();
    expect(data).not.toBeUndefined();
    expect(data!.getCareerByCode).toMatchObject({
      code: career.code,
      credits: career.credits,
      description: career.description
    });
  });

  describe("Errors", () => {
    it("throws Career Not found if the code doesn't exists", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.query({
        query: GET_CAREER_BY_CODE,
        variables: { code: "3" }
      });
      expect(errors![0].extensions!.data).toEqual(
        {
          errorType: CareersNotFound.name
        }
      );
    });

    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();

      const { errors } = await apolloClient.query({
        query: GET_CAREER_BY_CODE,
        variables: { code: "3" }
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });
  });
});
