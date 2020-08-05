import { gql } from "apollo-server";

import { testClientFactory } from "$mocks/testClientFactory";

import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";

import { client } from "../../ApolloTestClient";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

const UPDATE_CURRENT_COMPANY = gql`
    mutation (
        $companyName: String,
        $slogan: String,
        $description: String,
        $logo: String,
        $website: String,
        $email: String,
        $phoneNumbers: [String],
        $photos: [String]) {
        updateCurrentCompany(
            companyName: $companyName,
            slogan: $slogan, description: $description,
            logo: $logo,
            website: $website,
            email: $email,
            phoneNumbers: $phoneNumbers,
            photos: $photos
        ) {
            companyName
            slogan
            description
            logo
            website
            email
        }
    }
`;

describe("updateCurrentCompany", () => {
  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  describe("When the update succeeds", () => {
    it("update all company attributes", async () => {
      const { apolloClient } = await testClientFactory.company();
      const dataToUpdate = {
        companyName: "Devartis SA",
        slogan: "new slogan",
        description: "new description",
        logo: "",
        website: "http://www.new-site.com",
        email: "old@devartis.com"
      };
      const { data, errors } = await apolloClient.mutate({
        mutation: UPDATE_CURRENT_COMPANY,
        variables: dataToUpdate
      });
      expect(errors).toBeUndefined();
      expect(data!.updateCurrentCompany).toEqual(dataToUpdate);
    });
  });

  describe("when the update errors", () => {
    it("throws an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const dataToUpdate = { companyName: "new company name" };
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_CURRENT_COMPANY,
        variables: dataToUpdate
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("throws an error if current user is not a company user", async () => {
      const { apolloClient } = await testClientFactory.user();
      const dataToUpdate = { companyName: "new company name" };
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_CURRENT_COMPANY,
        variables: dataToUpdate
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});
