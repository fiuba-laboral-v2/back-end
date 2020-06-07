import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { CompanyRepository } from "../../../../src/models/Company";
import { UserRepository } from "../../../../src/models/User";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import { CompanyGenerator, TCompanyDataGenerator } from "../../../generators/Company";

const SAVE_COMPANY_WITH_COMPLETE_DATA = gql`
  mutation (
      $user: UserInput!,
      $cuit: String!,
      $companyName: String!,
      $slogan: String,
      $description: String,
      $logo: String,
      $website: String,
      $email: String,
      $phoneNumbers: [String],
      $photos: [String]
  ) {
    createCompany(
        user: $user,
        cuit: $cuit,
        companyName:
        $companyName,
        slogan: $slogan,
        description: $description,
        logo: $logo,
        website: $website,
        email: $email,
        phoneNumbers: $phoneNumbers,
        photos: $photos
    ) {
      cuit
      companyName
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
  mutation ($cuit: String!, $companyName: String!, $user: UserInput!) {
    createCompany(cuit: $cuit, companyName: $companyName, user: $user) {
      cuit
      companyName
    }
  }
`;

describe("createCompany", () => {
  let companiesData: TCompanyDataGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    companiesData = CompanyGenerator.data.completeData();
  });

  afterAll(() => Database.close());

  describe("When the creation succeeds", () => {
    it("create company", async () => {
      const { user, ...companyData } = companiesData.next().value;
      const response = await client.loggedOut().mutate({
        mutation: SAVE_COMPANY_WITH_COMPLETE_DATA,
        variables: { user, ...companyData }
      });
      expect(response.errors).toBeUndefined();
      expect(response.data).toEqual(
        {
          createCompany: {
            ...companyData,
            approvalStatus: ApprovalStatus.pending,
            phoneNumbers: expect.arrayContaining(companyData.phoneNumbers!)
          }
        }
      );
    });

    it("creates company with only obligatory data", async () => {
      const { user, cuit, companyName } = companiesData.next().value;
      const response = await client.loggedOut().mutate({
        mutation: SAVE_COMPANY_WITH_MINIMUM_DATA,
        variables: { user, cuit, companyName }
      });
      expect(response.errors).toBeUndefined();
      expect(response.data).not.toBeUndefined();
      expect(response.data).toEqual({ createCompany: { cuit, companyName } });
    });
  });

  describe("when the creation errors", () => {
    it("throws an error if the company with its cuit already exist", async () => {
      const companyData = companiesData.next().value;
      const cuit = companyData.cuit;
      await client.loggedOut().mutate({
        mutation: SAVE_COMPANY_WITH_MINIMUM_DATA,
        variables: companyData
      });
      const { errors } = await client.loggedOut().mutate({
        mutation: SAVE_COMPANY_WITH_MINIMUM_DATA,
        variables: {
          ...companiesData.next().value,
          cuit
        }
      });
      expect(
        errors![0].extensions!.data
      ).toEqual(
        { errorType: "CompanyCuitAlreadyExistsError" }
      );
    });
  });
});
