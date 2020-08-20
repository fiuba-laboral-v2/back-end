import { ApolloError, gql } from "apollo-server";
import { CareerRepository } from "$models/Career";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerGenerator } from "$generators/Career";
import { TestClientGenerator } from "$generators/TestClient";
import { UnauthorizedError } from "$graphql/Errors";

const SAVE_CAREER = gql`
  mutation SaveCareer($code: ID!, $description: String!) {
    saveCareer(code: $code, description: $description) {
      code
      description
    }
  }
`;

describe("saveCareer", () => {
  beforeAll(async () => {
    await CareerRepository.truncate();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  it("creates a new career", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const params = CareerGenerator.data();
    const { data, errors } = await apolloClient.mutate({
      mutation: SAVE_CAREER,
      variables: params
    });

    expect(errors).toBeUndefined();
    expect(data).not.toBeUndefined();
    expect(data!.saveCareer).toBeObjectContaining(params);
  });

  describe("Errors", () => {
    it("returns an error if the description is not provided", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_CAREER,
        variables: { code: "3" }
      });
      expect(errors![0].constructor.name).toEqual(ApolloError.name);
    });

    it("returns an error if career already exists", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const params = CareerGenerator.data();
      await apolloClient.mutate({ mutation: SAVE_CAREER, variables: params });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_CAREER,
        variables: params
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: "CareerAlreadyExistsError"
      });
    });

    it("returns an error if user is from a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const params = CareerGenerator.data();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_CAREER,
        variables: params
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });

    it("returns an error if user is an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const params = CareerGenerator.data();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_CAREER,
        variables: params
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    });
  });
});
