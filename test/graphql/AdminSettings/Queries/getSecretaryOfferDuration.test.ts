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
import { ApprovalStatus } from "$models/ApprovalStatus";

const GET_SECRETARY_OFFER_DURATION = gql`
  query getSecretaryOfferDuration($secretary: Secretary!) {
    getSecretaryOfferDuration(secretary: $secretary) {
      offerDurationInDays
    }
  }
`;

describe("getSecretaryOfferDuration", () => {
  let companyApolloClient;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await AdminRepository.truncate();
    await ApplicantRepository.truncate();
    await SecretarySettingsRepository.truncate();
    await SecretarySettingsGenerator.createDefaultSettings();

    ({ apolloClient: companyApolloClient } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    }));
  });

  it("returns the offerDuration of graduados secretary", async () => {
    const { offerDurationInDays } = await SecretarySettingsRepository.findBySecretary(
      Secretary.graduados
    );

    const { data, errors } = await companyApolloClient.query({
      query: GET_SECRETARY_OFFER_DURATION,
      variables: { secretary: Secretary.graduados }
    });

    expect(errors).toBeUndefined();
    expect(data!.getSecretaryOfferDuration).toEqual({ offerDurationInDays });
  });

  it("returns the offerDuration of extension secretary", async () => {
    const { offerDurationInDays } = await SecretarySettingsRepository.findBySecretary(
      Secretary.extension
    );
    const { data, errors } = await companyApolloClient.query({
      query: GET_SECRETARY_OFFER_DURATION,
      variables: { secretary: Secretary.extension }
    });

    expect(errors).toBeUndefined();
    expect(data!.getSecretaryOfferDuration).toEqual({ offerDurationInDays });
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const { errors } = await apolloClient.query({
        query: GET_SECRETARY_OFFER_DURATION,
        variables: { secretary: Secretary.graduados }
      });

      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if current user is not a company user", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const { errors } = await apolloClient.query({
        query: GET_SECRETARY_OFFER_DURATION,
        variables: { secretary: Secretary.graduados }
      });

      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error when the user is an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { errors } = await apolloClient.query({
        query: GET_SECRETARY_OFFER_DURATION,
        variables: { secretary: Secretary.graduados }
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
