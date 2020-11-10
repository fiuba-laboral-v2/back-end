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

const UPDATE_MY_SECRETARY_SETTINGS = gql`
  mutation updateMySecretarySettings($offerDurationInDays: Int!) {
    updateMySecretarySettings(offerDurationInDays: $offerDurationInDays) {
      secretary
      offerDurationInDays
    }
  }
`;

describe("updateMySecretarySettings", () => {
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

  describe("when the user using the endpoint is an admin from graduados", () => {
    it("updates all the values of the secretary settings of graduados", async () => {
      const { offerDurationInDays } = await SecretarySettingsRepository.findBySecretary(
        Secretary.graduados
      );

      const { data, errors } = await graduadosApolloClient.mutate({
        mutation: UPDATE_MY_SECRETARY_SETTINGS,
        variables: { offerDurationInDays: 2 }
      });

      const {
        offerDurationInDays: updatedOfferDuration
      } = await SecretarySettingsRepository.findBySecretary(Secretary.graduados);
      expect(errors).toBeUndefined();
      expect(data!.updateMySecretarySettings).toEqual({
        secretary: Secretary.graduados,
        offerDurationInDays: updatedOfferDuration
      });
      expect(offerDurationInDays).toEqual(15);
    });
  });

  describe("when the user using the endpoint is an admin from extension", () => {
    it("updates all the values of the secretary settings of extension", async () => {
      const { offerDurationInDays } = await SecretarySettingsRepository.findBySecretary(
        Secretary.extension
      );

      const { data, errors } = await extensionApolloClient.mutate({
        mutation: UPDATE_MY_SECRETARY_SETTINGS,
        variables: { offerDurationInDays: 4 }
      });

      const {
        offerDurationInDays: updatedOfferDuration
      } = await SecretarySettingsRepository.findBySecretary(Secretary.extension);
      expect(errors).toBeUndefined();
      expect(data!.updateMySecretarySettings).toEqual({
        secretary: Secretary.extension,
        offerDurationInDays: updatedOfferDuration
      });
      expect(offerDurationInDays).toEqual(15);
    });
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_MY_SECRETARY_SETTINGS,
        variables: { offerDurationInDays: 2 }
      });

      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if current user is not an admin", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_MY_SECRETARY_SETTINGS,
        variables: { offerDurationInDays: 2 }
      });

      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error when the user is from a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_MY_SECRETARY_SETTINGS,
        variables: { offerDurationInDays: 2 }
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error when the user is an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_MY_SECRETARY_SETTINGS,
        variables: { offerDurationInDays: 2 }
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
