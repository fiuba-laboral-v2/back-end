import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { Database } from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { CareersNotFound } from "../../../../src/models/Career/Errors/CareersNotFound";
import { CareerGenerator, TCareerGenerator } from "../../../generators/Career";
import { testClientFactory } from "../../../mocks/testClientFactory";

import { AuthenticationError } from "../../../../src/graphql/Errors";

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
    Database.setConnection();
    await CareerRepository.truncate();
    careers = CareerGenerator.instance();
  });

  afterAll(() => Database.close());

  it("gets a career using the code", async () => {
    const { apolloClient } = await testClientFactory.user();
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
      const { apolloClient } = await testClientFactory.user();
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
