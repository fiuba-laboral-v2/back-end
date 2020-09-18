import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CompanyGenerator } from "$generators/Company";

const SAVE_COMPANY_WITH_COMPLETE_DATA = gql`
  mutation(
    $user: UserInput!
    $cuit: String!
    $companyName: String!
    $businessName: String!
    $slogan: String
    $description: String
    $logo: String
    $website: String
    $email: String
    $phoneNumbers: [String]
    $photos: [String]
  ) {
    createCompany(
      user: $user
      cuit: $cuit
      companyName: $companyName
      businessName: $businessName
      slogan: $slogan
      description: $description
      logo: $logo
      website: $website
      email: $email
      phoneNumbers: $phoneNumbers
      photos: $photos
    ) {
      cuit
      companyName
      businessName
      slogan
      description
      logo
      website
      email
      approvalStatus
      phoneNumbers
      photos
    }
  }
`;

const SAVE_COMPANY_WITH_MINIMUM_DATA = gql`
  mutation($cuit: String!, $companyName: String!, $businessName: String!, $user: UserInput!) {
    createCompany(
      cuit: $cuit
      companyName: $companyName
      businessName: $businessName
      user: $user
    ) {
      cuit
      companyName
      businessName
    }
  }
`;

describe("createCompany", () => {
  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  describe("When the creation succeeds", () => {
    it("create company", async () => {
      const { user, ...companyData } = CompanyGenerator.data.completeData();
      const response = await client.loggedOut().mutate({
        mutation: SAVE_COMPANY_WITH_COMPLETE_DATA,
        variables: { user, ...companyData }
      });
      expect(response.errors).toBeUndefined();
      expect(response.data).toEqual({
        createCompany: {
          ...companyData,
          approvalStatus: ApprovalStatus.pending,
          phoneNumbers: expect.arrayContaining(companyData.phoneNumbers!)
        }
      });
    });

    it("creates company with only obligatory data", async () => {
      const { user, cuit, businessName, companyName } = CompanyGenerator.data.completeData();
      const response = await client.loggedOut().mutate({
        mutation: SAVE_COMPANY_WITH_MINIMUM_DATA,
        variables: { user, cuit, businessName, companyName }
      });
      expect(response.errors).toBeUndefined();
      expect(response.data).not.toBeUndefined();
      expect(response.data).toEqual({ createCompany: { cuit, companyName, businessName } });
    });
  });

  describe("when the creation errors", () => {
    it("throws an error if the company with its cuit already exist", async () => {
      const companyData = CompanyGenerator.data.completeData();
      const cuit = companyData.cuit;
      await client.loggedOut().mutate({
        mutation: SAVE_COMPANY_WITH_MINIMUM_DATA,
        variables: companyData
      });
      const { errors } = await client.loggedOut().mutate({
        mutation: SAVE_COMPANY_WITH_MINIMUM_DATA,
        variables: {
          ...CompanyGenerator.data.completeData(),
          cuit
        }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: "CompanyCuitAlreadyExistsError"
      });
    });
  });
});
