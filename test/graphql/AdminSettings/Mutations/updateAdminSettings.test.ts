import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { TestClientGenerator } from "$generators/TestClient";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { AdminRepository, Secretary } from "$models/Admin";
import { CompanyRepository } from "$models/Company";
import { ApplicantRepository } from "$models/Applicant";
import { UserRepository } from "$models/User";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";

const UPDATE_ADMIN_SETTINGS = gql`
  mutation updateAdminSettings(
    $offerDurationInDays: Int!
    $email: String!
    $emailSignature: String!
  ) {
    updateAdminSettings(
      offerDurationInDays: $offerDurationInDays
      email: $email
      emailSignature: $emailSignature
    ) {
      email
      emailSignature
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

    ({ apolloClient: graduadosApolloClient } = await TestClientGenerator.admin({
      secretary: Secretary.graduados
    }));
    ({ apolloClient: extensionApolloClient } = await TestClientGenerator.admin({
      secretary: Secretary.extension
    }));
  });

  afterAll(async () => {
    await SecretarySettingsRepository.truncate();
    await SecretarySettingsGenerator.createDefaultSettings();
  });

  describe("when the current user is an admin from graduados", () => {
    it("updates the secretary settings of graduados", async () => {
      const newOfferDurationInDays = 2;
      const newEmail = "bla@ble.bli";
      const newEmailSignature = "new signature";

      const {
        offerDurationInDays,
        email,
        emailSignature
      } = await SecretarySettingsRepository.findBySecretary(Secretary.graduados);

      expect(offerDurationInDays).not.toEqual(newOfferDurationInDays);
      expect(email).not.toEqual(newEmail);
      expect(emailSignature).not.toEqual(newEmailSignature);

      const { data, errors } = await graduadosApolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: {
          offerDurationInDays: newOfferDurationInDays,
          email: newEmail,
          emailSignature: newEmailSignature
        }
      });

      expect(errors).toBeUndefined();
      expect(data!.updateAdminSettings).toEqual({
        email: newEmail,
        emailSignature: newEmailSignature,
        offerDurationInDays: newOfferDurationInDays
      });

      expect(
        await SecretarySettingsRepository.findBySecretary(Secretary.graduados)
      ).toBeObjectContaining({
        offerDurationInDays: newOfferDurationInDays,
        email: newEmail,
        emailSignature: newEmailSignature
      });
    });

    it("doesn't update the secretary settings of extension", async () => {
      const {
        offerDurationInDays,
        email,
        emailSignature
      } = await SecretarySettingsRepository.findBySecretary(Secretary.extension);

      const { errors } = await graduadosApolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: 2, email: "foo@bar.baz", emailSignature: "new signature" }
      });

      const {
        offerDurationInDays: updatedOfferDuration,
        email: updatedEmail,
        emailSignature: updatedEmailSignature
      } = await SecretarySettingsRepository.findBySecretary(Secretary.extension);

      expect(errors).toBeUndefined();
      expect(offerDurationInDays).toEqual(updatedOfferDuration);
      expect(email).toEqual(updatedEmail);
      expect(emailSignature).toEqual(updatedEmailSignature);
    });
  });

  describe("when the current user is an admin from extension", () => {
    it("updates the secretary settings of extension", async () => {
      const newOfferDurationInDays = 2;
      const newEmail = "bla@ble.bli";
      const newEmailSignature = "sign a signature";

      const {
        offerDurationInDays,
        email,
        emailSignature
      } = await SecretarySettingsRepository.findBySecretary(Secretary.extension);

      expect(offerDurationInDays).not.toEqual(newOfferDurationInDays);
      expect(email).not.toEqual(newEmail);
      expect(emailSignature).not.toEqual(newEmailSignature);

      const { data, errors } = await extensionApolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: {
          offerDurationInDays: newOfferDurationInDays,
          email: newEmail,
          emailSignature: newEmailSignature
        }
      });

      expect(errors).toBeUndefined();
      expect(data!.updateAdminSettings).toEqual({
        email: newEmail,
        offerDurationInDays: newOfferDurationInDays,
        emailSignature: newEmailSignature
      });

      expect(
        await SecretarySettingsRepository.findBySecretary(Secretary.extension)
      ).toBeObjectContaining({
        offerDurationInDays: newOfferDurationInDays,
        email: newEmail,
        emailSignature: newEmailSignature
      });
    });

    it("doesn't update the secretary settings of graduados", async () => {
      const {
        offerDurationInDays,
        email,
        emailSignature
      } = await SecretarySettingsRepository.findBySecretary(Secretary.graduados);

      const { errors } = await extensionApolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: 2, email: "foo@bar.baz", emailSignature: "signysign" }
      });

      const {
        offerDurationInDays: updatedOfferDuration,
        email: updatedEmail,
        emailSignature: updatedEmailSignature
      } = await SecretarySettingsRepository.findBySecretary(Secretary.graduados);

      expect(errors).toBeUndefined();
      expect(offerDurationInDays).toEqual(updatedOfferDuration);
      expect(email).toEqual(updatedEmail);
      expect(emailSignature).toEqual(updatedEmailSignature);
    });
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: 2, email: "foo@bar.baz", emailSignature: "foo" }
      });

      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if current user is not an admin", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: 2, email: "foo@bar.baz", emailSignature: "bar" }
      });

      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error when the user is from a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: 2, email: "foo@bar.baz", emailSignature: "baz" }
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error when the user is an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_ADMIN_SETTINGS,
        variables: { offerDurationInDays: 2, email: "foo@bar.baz", emailSignature: "foofoo" }
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
