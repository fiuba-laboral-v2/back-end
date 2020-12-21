import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { CompanyRepository, ICompany } from "$models/Company";
import { UserRepository } from "$models/User";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CompanyGenerator } from "$generators/Company";

const SAVE_COMPANY = gql`
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

describe("createCompany", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  const performMutation = (companyData: ICompany) =>
    client.loggedOut().mutate({
      mutation: SAVE_COMPANY,
      variables: companyData
    });

  it("creates company", async () => {
    const { user, ...companyData } = CompanyGenerator.data.completeData();
    const response = await performMutation({ user, ...companyData });
    expect(response.errors).toBeUndefined();
    expect(response.data!.createCompany).toEqual({
      ...companyData,
      approvalStatus: ApprovalStatus.pending,
      phoneNumbers: expect.arrayContaining(companyData.phoneNumbers!)
    });
  });

  it("throws an error if phoneNumbers are invalid", async () => {
    const attributes = CompanyGenerator.data.completeData();
    const { errors } = await performMutation({
      ...attributes,
      phoneNumbers: ["InvalidPhoneNumber1", "InvalidPhoneNumber2"]
    });
    expect(errors).toEqualGraphQLErrorType("SubError");
  });

  it("throws an error if phoneNumbers are duplicated", async () => {
    const attributes = CompanyGenerator.data.completeData();
    const { errors } = await performMutation({
      ...attributes,
      phoneNumbers: ["1159821066", "1159821066"]
    });
    expect(errors).toEqualGraphQLErrorType("DuplicatedPhoneNumberAlreadyExistsError");
  });

  it("throws an error if the company with its cuit already exist", async () => {
    const companyData = CompanyGenerator.data.completeData();
    const cuit = companyData.cuit;
    await performMutation(companyData);
    const { errors } = await performMutation({ ...CompanyGenerator.data.completeData(), cuit });
    expect(errors).toEqualGraphQLErrorType("CompanyCuitAlreadyExistsError");
  });
});
