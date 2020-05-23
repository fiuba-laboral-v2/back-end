import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { Career } from "../../../../src/models/Career";
import { CareersNotFound } from "../../../../src/models/Career/Errors/CareersNotFound";
import { careerMocks } from "../../../models/Career/mocks";

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
    Database.setConnection();
    await Career.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("gets a career using the code", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());

    const { data, errors } = await executeQuery(GET_CAREER_BY_CODE, { code: career.code });
    expect(errors).toBeUndefined();
    expect(data).not.toBeUndefined();
    expect(data!.getCareerByCode).toMatchObject({
      code: career.code,
      credits: career.credits,
      description: career.description
    });
  });

  it("throws Career Not found if the code doesn't exists", async () => {
    const { errors } = await executeQuery(GET_CAREER_BY_CODE, { code: "3" });
    expect(errors![0].extensions!.data).toEqual(
      {
        errorType: CareersNotFound.name
      }
    );
  });
});
