import { gql } from "apollo-server";
import Database from "../../../../src/config/Database";
import { CompanyRepository } from "../../../../src/models/Company";
import { UserRepository } from "../../../../src/models/User";
import { client } from "../../ApolloTestClient";
import { testClientFactory } from "../../../mocks/testClientFactory";
import { AuthenticationError } from "../../../../src/graphql/Errors";

const query = gql`
  query ($uuid: ID!) {
    getCompanyByUuid(uuid: $uuid) {
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

describe("getCompanyByUuid", () => {
  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  afterAll(() => Database.close());

  it("finds a company given its uuid", async () => {
    const { apolloClient, company } = await testClientFactory.company();
    const response = await apolloClient.query({
      query: query,
      variables: { uuid: company.uuid }
    });
    expect(response.errors).toBeUndefined();
    expect(response.data).toEqual({
      getCompanyByUuid: {
        cuit: company.cuit,
        companyName: company.companyName,
        slogan: company.slogan,
        description: company.description,
        logo: company.logo,
        website: company.website,
        email: company.email,
        approvalStatus: company.approvalStatus,
        phoneNumbers: expect.arrayContaining((await company.getPhoneNumbers())),
        photos: expect.arrayContaining((await company.getPhotos()))
      }
    });
  });

  it("returns error if the Company does not exists", async () => {
    const { apolloClient } = await testClientFactory.applicant();
    const notExistentUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const { errors } = await apolloClient.query({
      query: query,
      variables: { uuid: notExistentUuid }
    });
    expect(
      errors![0].extensions!.data
    ).toEqual(
      { errorType: "CompanyNotFoundError" }
    );
  });

  it("find a company with photos with an empty array", async () => {
    const { apolloClient, company } = await testClientFactory.company({ photos: [] });
    const { data, errors } = await apolloClient.query({
      query: query,
      variables: { uuid: company.uuid }
    });
    expect(errors).toBeUndefined();
    expect(data!.getCompanyByUuid.photos).toHaveLength(0);
  });

  it("returns an error if no user is loggedin", async () => {
    const { company } = await testClientFactory.company({ photos: [] });
    const { errors } = await client.loggedOut().query({
      query: query,
      variables: { uuid: company.uuid }
    });
    expect(
      errors![0].extensions!.data
    ).toEqual(
      { errorType: AuthenticationError.name }
    );
  });
});
