import { gql } from "apollo-server";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { client } from "../../ApolloTestClient";
import { TestClientGenerator } from "$generators/TestClient";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { CompanyGenerator } from "$generators/Company";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UUID } from "$models/UUID";

const query = gql`
  query($uuid: ID!) {
    getCompanyByUuid(uuid: $uuid) {
      cuit
      companyName
      businessName
      slogan
      description
      logo
      website
      email
      createdAt
      updatedAt
      approvalStatus
      phoneNumbers
      photos
      users {
        uuid
        email
        name
        surname
      }
    }
  }
`;

describe("getCompanyByUuid", () => {
  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  it("finds a company given its uuid", async () => {
    const company = await CompanyGenerator.instance.withCompleteData();
    const { apolloClient } = await TestClientGenerator.admin();
    const response = await apolloClient.query({
      query: query,
      variables: { uuid: company.uuid }
    });
    const phoneNumbers = await company.getPhoneNumbers();
    expect(response.errors).toBeUndefined();
    expect(response.data).toEqual({
      getCompanyByUuid: {
        cuit: company.cuit,
        companyName: company.companyName,
        businessName: company.businessName,
        slogan: company.slogan,
        description: company.description,
        logo: company.logo,
        website: company.website,
        email: company.email,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
        approvalStatus: company.approvalStatus,
        phoneNumbers: expect.arrayContaining(phoneNumbers.map(({ phoneNumber }) => phoneNumber)),
        photos: expect.arrayContaining(await company.getPhotos()),
        users: expect.arrayContaining(
          (await company.getUsers()).map(({ uuid, email, name, surname }) => ({
            uuid,
            email,
            name,
            surname
          }))
        )
      }
    });
  });

  it("returns error if the Company does not exist", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved
    });
    const notExistentUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const { errors } = await apolloClient.query({
      query: query,
      variables: { uuid: notExistentUuid }
    });
    expect(errors).toEqualGraphQLErrorType("CompanyNotFoundError");
  });

  it("find a company with photos with an empty array", async () => {
    const company = await CompanyGenerator.instance.withCompleteData({
      photos: []
    });
    const { apolloClient } = await TestClientGenerator.admin();
    const { data, errors } = await apolloClient.query({
      query: query,
      variables: { uuid: company.uuid }
    });
    expect(errors).toBeUndefined();
    expect(data!.getCompanyByUuid.photos).toHaveLength(0);
  });

  it("returns an error if no user is loggedin", async () => {
    const { errors } = await client.loggedOut().query({
      query: query,
      variables: { uuid: UUID.generate() }
    });
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if user is from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await apolloClient.query({
      query: query,
      variables: { uuid: UUID.generate() }
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await apolloClient.query({
      query: query,
      variables: { uuid: UUID.generate() }
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if user is a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.rejected
    });
    const { errors } = await apolloClient.query({
      query: query,
      variables: { uuid: UUID.generate() }
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
