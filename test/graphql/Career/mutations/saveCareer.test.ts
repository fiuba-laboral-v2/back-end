import { ApolloError, gql } from "apollo-server";
import { CareerRepository } from "$models/Career";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerGenerator } from "$generators/Career";
import { TestClientGenerator } from "$generators/TestClient";
import { UnauthorizedError } from "$graphql/Errors";

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
    await CareerRepository.truncate();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  it("creates the career model", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const params = CareerGenerator.data();
    const { data, errors } = await apolloClient.mutate({
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
      const { apolloClient } = await TestClientGenerator.admin();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_CAREER,
        variables: { code: "3", credits: 250 }
      });
      expect(errors![0].constructor.name).toEqual(ApolloError.name);
    });

    it("should throw an if career already exists", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const params = CareerGenerator.data();
      await apolloClient.mutate({ mutation: SAVE_CAREER, variables: params });
      const { errors } = await apolloClient.mutate({ mutation: SAVE_CAREER, variables: params });
      expect(errors![0].extensions!.data).toEqual(
        { errorType: "CareerAlreadyExistsError" }
      );
    });

    it("throws an error if user is from a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const params = CareerGenerator.data();
      const { errors } = await apolloClient.mutate({ mutation: SAVE_CAREER, variables: params });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("throws an error if user is an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const params = CareerGenerator.data();
      const { errors } = await apolloClient.mutate({ mutation: SAVE_CAREER, variables: params });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});
