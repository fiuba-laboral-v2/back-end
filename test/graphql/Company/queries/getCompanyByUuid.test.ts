import { gql } from "apollo-server";
import { CompanyRepository } from "../../../../src/models/Company";
import { UserRepository } from "../../../../src/models/User";
import { client } from "../../ApolloTestClient";
import { testClientFactory } from "../../../mocks/testClientFactory";
import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";
import { AdminExtensionGenerator, TAdminGenerator } from "../../../generators/Admin";
import { userFactory } from "../../../mocks/user";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import generateUuid from "uuid/v4";

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
  let admins: TAdminGenerator;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    admins = AdminExtensionGenerator.instance();
  });

  it("finds a company given its uuid", async () => {
    const company = await userFactory.company();
    const { apolloClient } = await testClientFactory.admin();
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
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
        approvalStatus: company.approvalStatus,
        phoneNumbers: expect.arrayContaining((await company.getPhoneNumbers())),
        photos: expect.arrayContaining((await company.getPhotos())),
        users: expect.arrayContaining((await company.getUsers()).map(
          ({ uuid, email, name, surname }) => ({ uuid, email, name, surname })
        ))
      }
    });
  });

  it("returns error if the Company does not exists", async () => {
    const { apolloClient } = await testClientFactory.applicant({
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: await admins.next().value
      }
    });
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
    const company = await userFactory.company({ photos: [] });
    const { apolloClient } = await testClientFactory.admin();
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
      variables: { uuid: generateUuid() }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
  });

  it("returns an error if user is from a company", async () => {
    const { apolloClient } = await testClientFactory.company();
    const { errors } = await apolloClient.query({
      query: query,
      variables: { uuid: generateUuid() }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("returns an error if user is a pending applicant", async () => {
    const { apolloClient } = await testClientFactory.applicant();
    const { errors } = await apolloClient.query({
      query: query,
      variables: { uuid: generateUuid() }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("returns an error if user is a rejected applicant", async () => {
    const { apolloClient } = await testClientFactory.applicant({
      status: {
        approvalStatus: ApprovalStatus.rejected,
        admin: await admins.next().value
      }
    });
    const { errors } = await apolloClient.query({
      query: query,
      variables: { uuid: generateUuid() }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });
});
