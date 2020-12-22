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

const UPDATE_ADMIN_SETTINGS = gql`
  mutation updateAdminSettings($offerDurationInDays: Int!, $email: String!) {
    updateAdminSettings(offerDurationInDays: $offerDurationInDays, email: $email) {
      email
      offerDurationInDays
    }
  }
`;

describe("updateAdminSettings", () => {
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

  describe("when the current user is an admin from graduados", () => {
    it("updates the secretary settings of graduados", async () => {
      const newOfferDurationInDays = 2;
      const newEmail = "bla@ble.bli";

      const { offerDurationInDays, email } = await SecretarySettingsRepository.findBySecretary(
        Secretary.graduados
      );

      expect(offerDurationInDays).not.toEqual(newOfferDurationInDays);
      expect(email).not.toEqual(newEmail);

      const { data, errors } = await graduadosApolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: newOfferDurationInDays, email: newEmail }
      });

      expect(errors).toBeUndefined();
      expect(data!.updateAdminSettings).toEqual({
        email: newEmail,
        offerDurationInDays: newOfferDurationInDays
      });

      expect(
        await SecretarySettingsRepository.findBySecretary(Secretary.graduados)
      ).toBeObjectContaining({ offerDurationInDays: newOfferDurationInDays, email: newEmail });
    });

    it("doesn't update the secretary settings of extension", async () => {
      const { offerDurationInDays, email } = await SecretarySettingsRepository.findBySecretary(
        Secretary.extension
      );

      const { errors } = await graduadosApolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: 2, email: "foo@bar.baz" }
      });

      const {
        offerDurationInDays: updatedOfferDuration,
        email: updatedEmail
      } = await SecretarySettingsRepository.findBySecretary(Secretary.extension);

      expect(errors).toBeUndefined();
      expect(offerDurationInDays).toEqual(updatedOfferDuration);
      expect(email).toEqual(updatedEmail);
    });
  });

  describe("when the current user is an admin from extension", () => {
    it("updates the secretary settings of extension", async () => {
      const newOfferDurationInDays = 2;
      const newEmail = "bla@ble.bli";

      const { offerDurationInDays, email } = await SecretarySettingsRepository.findBySecretary(
        Secretary.extension
      );

      expect(offerDurationInDays).not.toEqual(newOfferDurationInDays);
      expect(email).not.toEqual(newEmail);

      const { data, errors } = await extensionApolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: newOfferDurationInDays, email: newEmail }
      });

      expect(errors).toBeUndefined();
      expect(data!.updateAdminSettings).toEqual({
        email: newEmail,
        offerDurationInDays: newOfferDurationInDays
      });

      expect(
        await SecretarySettingsRepository.findBySecretary(Secretary.extension)
      ).toBeObjectContaining({ offerDurationInDays: newOfferDurationInDays, email: newEmail });
    });

    it("doesn't update the secretary settings of graduados", async () => {
      const { offerDurationInDays, email } = await SecretarySettingsRepository.findBySecretary(
        Secretary.graduados
      );

      const { errors } = await extensionApolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: 2, email: "foo@bar.baz" }
      });

      const {
        offerDurationInDays: updatedOfferDuration,
        email: updatedEmail
      } = await SecretarySettingsRepository.findBySecretary(Secretary.graduados);

      expect(errors).toBeUndefined();
      expect(offerDurationInDays).toEqual(updatedOfferDuration);
      expect(email).toEqual(updatedEmail);
    });
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: 2, email: "foo@bar.baz" }
      });

      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if current user is not an admin", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: 2, email: "foo@bar.baz" }
      });

      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error when the user is from a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: 2, email: "foo@bar.baz" }
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error when the user is an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: 2, email: "foo@bar.baz" }
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
