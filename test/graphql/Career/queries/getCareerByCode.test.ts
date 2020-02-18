import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { Career } from "../../../../src/models/Career";
import { careerMocks } from "../../../models/Career/mocks";

import { UserInputError } from "apollo-server";

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

  beforeAll(async () => {
    await Database.setConnection();
    await Career.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("gets a career using the code", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());

    const response = await executeQuery(GET_CAREER_BY_CODE, { code: career.code });
    expect(response.errors).toBeUndefined();
    expect(response.data).not.toBeUndefined();
    expect(response.data.getCareerByCode).toMatchObject({
      code: career.code,
      credits: career.credits,
      description: career.description
    });
  });

  it("throws Career Not found if the code doesn't exists", async () => {
    const response = await executeQuery(GET_CAREER_BY_CODE, { code: "3" });

    expect(response.errors[0]).toEqual(new UserInputError("Career Not found"));
  });
});
