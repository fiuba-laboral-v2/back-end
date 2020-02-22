import { gql, ApolloError } from "apollo-server";
import { executeMutation, executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { Career } from "../../../../src/models/Career";
import { careerMocks } from "../../../models/Career/mocks";

const SAVE_CAREER = gql`
  mutation SaveCareer($code: ID!, $description: String!, $credits: Int!) {
    saveCareer(code: $code, description: $description, credits: $credits) {
      code
      description
      credits
    }
  }
`;

describe("saveCareer", () => {

  beforeAll(async () => {
    await Database.setConnection();
    await Career.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("creates the career model", async () => {
    const params = careerMocks.careerData();
    const response = await executeQuery(SAVE_CAREER, params);

    expect(response.errors).toBeUndefined();
    expect(response.data).not.toBeUndefined();
    expect(response.data.saveCareer).toMatchObject({
      code: params.code,
      credits: params.credits,
      description: params.description
    });
  });

  it("throws Career Not found if the code doesn't exists", async () => {
    const response = await executeMutation(SAVE_CAREER, { code: "3" , credits: 250});

    expect(response.errors[0]).toEqual(
      new ApolloError(`Variable "$description" of required type "String!" was not provided.`)
    );
  });
});
