import { gql, ApolloError } from "apollo-server";
import { client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { CareerRepository } from "../../../../src/models/Career";
import { CareerGenerator, TCareerDataGenerator } from "../../../generators/Career";

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
  let careersData: TCareerDataGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CareerRepository.truncate();
    careersData = CareerGenerator.data();
  });

  afterAll(() => Database.close());

  it("creates the career model", async () => {
    const params = careersData.next().value;
    const { data, errors } = await client.loggedOut().mutate({
      mutation: SAVE_CAREER,
      variables: params
    });

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
      const { errors } = await client.loggedOut().mutate({
        mutation: SAVE_CAREER,
        variables: { code: "3" , credits: 250 }
      });
      expect(errors![0].constructor.name).toEqual(ApolloError.name);
    });

    it("should throw an if career already exist", async () => {
      const params = careersData.next().value;
      await client.loggedOut().mutate({ mutation: SAVE_CAREER, variables: params });
      const { errors } = await client.loggedOut().mutate({
        mutation: SAVE_CAREER,
        variables: params
      });
      expect(errors![0].extensions!.data).toEqual(
        { errorType: "CareerAlreadyExistsError" }
      );
    });
  });
});
