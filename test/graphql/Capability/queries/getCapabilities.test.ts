import { gql } from "apollo-server";
import { CapabilityRepository } from "$models/Capability";
import { UserRepository } from "$models/User";
import { client } from "../../ApolloTestClient";

import { TestClientGenerator } from "$generators/TestClient";

import { AuthenticationError } from "$graphql/Errors";

const GET_CAPABILITIES = gql`
  query {
    getCapabilities {
      uuid
      description
    }
  }
`;

describe("getCapabilities", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    return CapabilityRepository.truncate();
  });

  it("brings all capabilities in the database", async () => {
    const { apolloClient } = await TestClientGenerator.user();
    const [java, python, ruby] = await Promise.all(
      ["java", "python", "ruby"].map(description =>
        CapabilityRepository.create({ description: description })
      )
    );
    const { data } = await apolloClient.query({ query: GET_CAPABILITIES });
    expect(data!.getCapabilities).toEqual(
      expect.arrayContaining([
        { description: "java", uuid: java.uuid },
        { description: "python", uuid: python.uuid },
        { description: "ruby", uuid: ruby.uuid }
      ])
    );
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();

      const { errors } = await apolloClient.query({ query: GET_CAPABILITIES });
      expect(errors).toIncludeGraphQLErrorType(AuthenticationError.name);
    });
  });
});
