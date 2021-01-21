import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { IUpdateAdminSettingsVariables } from "$graphql/AdminSettings/Mutations/updateAdminSettings";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { AdminRepository, Secretary } from "$models/Admin";
import { CompanyRepository } from "$models/Company";
import { ApplicantRepository } from "$models/Applicant";
import { UserRepository } from "$models/User";
import { SharedSettingsRepository } from "$models/SharedSettings";

import { SecretarySettingsGenerator } from "$generators/SecretarySettings";
import { TestClientGenerator } from "$generators/TestClient";

const UPDATE_ADMIN_SETTINGS = gql`
  mutation updateAdminSettings(
    $offerDurationInDays: Int!
    $email: String!
    $emailSignature: String!
    $automaticJobApplicationApproval: Boolean!
    $companySignUpAcceptanceCriteria: String!
    $companyEditableAcceptanceCriteria: String!
    $editOfferAcceptanceCriteria: String!
  ) {
    updateAdminSettings(
      offerDurationInDays: $offerDurationInDays
      email: $email
      emailSignature: $emailSignature
      automaticJobApplicationApproval: $automaticJobApplicationApproval
      companySignUpAcceptanceCriteria: $companySignUpAcceptanceCriteria
      companyEditableAcceptanceCriteria: $companyEditableAcceptanceCriteria
      editOfferAcceptanceCriteria: $editOfferAcceptanceCriteria
    ) {
      email
      emailSignature
      offerDurationInDays
      automaticJobApplicationApproval
      companySignUpAcceptanceCriteria
      companyEditableAcceptanceCriteria
      editOfferAcceptanceCriteria
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

  const updateGraduadosSettings = (variables: IUpdateAdminSettingsVariables) =>
    graduadosApolloClient.mutate({ mutation: UPDATE_ADMIN_SETTINGS, variables });

  const updateExtensionSettings = (variables: IUpdateAdminSettingsVariables) =>
    extensionApolloClient.mutate({ mutation: UPDATE_ADMIN_SETTINGS, variables });

  describe("when the current user is an admin from graduados", () => {
    it("updates the secretary settings of graduados", async () => {
      const secretary = Secretary.graduados;
      const variables = {
        offerDurationInDays: 2,
        email: "bla@fi.uba.ar",
        emailSignature: "new signature",
        automaticJobApplicationApproval: false,
        companySignUpAcceptanceCriteria: "new sign up",
        companyEditableAcceptanceCriteria: "new editable",
        editOfferAcceptanceCriteria: "new edit offer"
      };

      const secretarySettings = await SecretarySettingsRepository.findBySecretary(secretary);
      const sharedSettings = await SharedSettingsRepository.fetch();

      const currentSettings = { ...sharedSettings.toJSON(), ...secretarySettings.toJSON() };
      expect(currentSettings).not.toEqual(variables);
      const { data, errors } = await updateGraduadosSettings(variables);
      expect(errors).toBeUndefined();
      expect(data!.updateAdminSettings).toEqual(variables);
    });

    it("doesn't update the secretary settings of extension", async () => {
      const secretary = Secretary.extension;
      const secretarySettings = await SecretarySettingsRepository.findBySecretary(secretary);
      const sharedSettings = await SharedSettingsRepository.fetch();
      const { errors } = await updateGraduadosSettings({
        offerDurationInDays: 2,
        email: "foo@fi.uba.ar",
        emailSignature: "new signature",
        automaticJobApplicationApproval: true,
        companySignUpAcceptanceCriteria: "sign sign",
        companyEditableAcceptanceCriteria: "company company",
        editOfferAcceptanceCriteria: "offer offer"
      });

      const updatedSecretarySettings = await SecretarySettingsRepository.findBySecretary(secretary);
      const updatedSharedSettings = await SharedSettingsRepository.fetch();

      expect(errors).toBeUndefined();
      expect(secretarySettings.toJSON()).toEqual(updatedSecretarySettings.toJSON());
      expect(sharedSettings.toJSON()).not.toEqual(updatedSharedSettings.toJSON());
    });
  });

  describe("when the current user is an admin from extension", () => {
    it("updates the secretary settings of extension", async () => {
      const secretary = Secretary.extension;
      const variables = {
        offerDurationInDays: 2,
        email: "bla@fi.uba.ar",
        emailSignature: "sign a signature",
        automaticJobApplicationApproval: true,
        companySignUpAcceptanceCriteria: "newww sign up",
        companyEditableAcceptanceCriteria: "newww editable",
        editOfferAcceptanceCriteria: "newww edit offer"
      };
      const secretarySettings = await SecretarySettingsRepository.findBySecretary(secretary);
      const sharedSettings = await SharedSettingsRepository.fetch();
      const settings = { ...secretarySettings.toJSON(), ...sharedSettings.toJSON() };
      expect(settings).not.toEqual(variables);
      const { data, errors } = await updateExtensionSettings(variables);
      expect(errors).toBeUndefined();
      expect(data!.updateAdminSettings).toEqual(variables);
    });

    it("doesn't update the secretary settings of graduados", async () => {
      const secretary = Secretary.graduados;
      const secretarySettings = await SecretarySettingsRepository.findBySecretary(secretary);
      const sharedSettings = await SharedSettingsRepository.fetch();

      const { errors } = await updateExtensionSettings({
        offerDurationInDays: 2,
        email: "foo@fi.uba.ar",
        emailSignature: "signysign",
        automaticJobApplicationApproval: true,
        companySignUpAcceptanceCriteria: "criiiteria",
        companyEditableAcceptanceCriteria: "criiteria",
        editOfferAcceptanceCriteria: "criteria"
      });

      const updatedSecretarySettings = await SecretarySettingsRepository.findBySecretary(secretary);
      const updatedSharedSettings = await SharedSettingsRepository.fetch();
      expect(errors).toBeUndefined();
      expect(updatedSecretarySettings.toJSON()).toEqual(secretarySettings.toJSON());
      expect(sharedSettings.toJSON()).not.toEqual(updatedSharedSettings.toJSON());
    });
  });

  describe("Errors", () => {
    const variables = {
      offerDurationInDays: 2,
      email: "foo@bar.baz",
      emailSignature: "foo",
      automaticJobApplicationApproval: true,
      companySignUpAcceptanceCriteria: "criiiteria",
      companyEditableAcceptanceCriteria: "criiteria",
      editOfferAcceptanceCriteria: "criteria"
    };

    const performMutation = (apolloClient: TestClient) =>
      apolloClient.mutate({ mutation: UPDATE_ADMIN_SETTINGS, variables });

    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const { errors } = await performMutation(apolloClient);

      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if current user is not an admin", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await performMutation(apolloClient);

      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error when the user is from a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const { errors } = await performMutation(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error when the user is an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { errors } = await performMutation(apolloClient);
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
