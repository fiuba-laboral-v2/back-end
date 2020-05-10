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
    const { data, errors } = await executeQuery(SAVE_CAREER, params);

    expect(errors).toBeUndefined();
    expect(data).not.toBeUndefined();
    expect(data!.saveCareer).toMatchObject({
      code: params.code,
      credits: params.credits,
      description: params.description
    });
  });

  describe("Errors", () => {
    it("should throw an if the description is not provided", async () => {
      const { errors } = await executeMutation(SAVE_CAREER, { code: "3" , credits: 250 });
      expect(errors![0].constructor.name).toEqual(ApolloError.name);
    });

    it("should throw an if career already exist", async () => {
      const params = careerMocks.careerData();
      await executeQuery(SAVE_CAREER, params);
      const { errors } = await executeMutation(SAVE_CAREER, params);
      expect(errors![0].extensions!.data).toEqual(
        { errorType: "CareerAlreadyExistsError" }
      );
    });
  });
});
