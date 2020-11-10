import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { TestClientGenerator } from "$generators/TestClient";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";

import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { AdminRepository, Secretary } from "$models/Admin";
import { CompanyRepository } from "$models/Company";
import { ApplicantRepository } from "$models/Applicant";
import { UserRepository } from "$models/User";

const GET_MY_SECRETARY_SETTINGS = gql`
  query {
    getMySecretarySettings {
      secretary
      offerDurationInDays
    }
  }
`;

describe("getMySecretarySettings", () => {
  let graduadosApolloClient;
  let extensionApolloClient;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await AdminRepository.truncate();
    await ApplicantRepository.truncate();
    await SecretarySettingsRepository.truncate();
    await SecretarySettingsGenerator.createDefaultSettings();

    ({ apolloClient: graduadosApolloClient } = await TestClientGenerator.admin({
      secretary: Secretary.graduados
    }));
    ({ apolloClient: extensionApolloClient } = await TestClientGenerator.admin({
      secretary: Secretary.extension
    }));
  });

  it("returns the settings for graduados when the current user is an admin from that secretary", async () => {
    const { data, errors } = await graduadosApolloClient.query({
      query: GET_MY_SECRETARY_SETTINGS
    });

    const { offerDurationInDays } = await SecretarySettingsRepository.findBySecretary(
      Secretary.graduados
    );
    expect(errors).toBeUndefined();
    expect(data!.getMySecretarySettings).toEqual({
      secretary: Secretary.graduados,
      offerDurationInDays
    });
  });

  it("returns the settings for extension when the current user is an admin from that secretary", async () => {
    const { data, errors } = await extensionApolloClient.query({
      query: GET_MY_SECRETARY_SETTINGS
    });

    const { offerDurationInDays } = await SecretarySettingsRepository.findBySecretary(
      Secretary.extension
    );
    expect(errors).toBeUndefined();
    expect(data!.getMySecretarySettings).toEqual({
      secretary: Secretary.extension,
      offerDurationInDays
    });
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const { errors } = await apolloClient.query({
        query: GET_MY_SECRETARY_SETTINGS
      });

      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if current user is not an admin", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.query({ query: GET_MY_SECRETARY_SETTINGS });

      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error when the user is from a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const { errors } = await apolloClient.query({ query: GET_MY_SECRETARY_SETTINGS });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error when the user is an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { errors } = await apolloClient.query({ query: GET_MY_SECRETARY_SETTINGS });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
