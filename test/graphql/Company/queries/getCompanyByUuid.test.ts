import { gql } from "apollo-server";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { client } from "../../ApolloTestClient";
import { TestClientGenerator } from "$generators/TestClient";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { ApprovalStatus } from "$models/ApprovalStatus";
import generateUuid from "uuid/v4";
import { Secretary } from "$models/Admin";

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
        dni
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
    expect(response.errors).toBeUndefined();
    const phoneNumbers = await company.getPhoneNumbers();
    const users = await company.getUsers();
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
        phoneNumbers: expect.arrayContaining(phoneNumbers.map(({ phoneNumber }) => phoneNumber)),
        photos: expect.arrayContaining((await company.getPhotos())),
        users: expect.arrayContaining(users.map(({ uuid, email, dni, name, surname }) =>
            ({ uuid, email, dni, name, surname })
        ))
      }
    });
  });

  it("returns error if the Company does not exists", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: await AdminGenerator.instance(Secretary.extension)
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
    const company = await CompanyGenerator.instance.withCompleteData({ photos: [] });
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
      variables: { uuid: generateUuid() }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
  });

  it("returns an error if user is from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await apolloClient.query({
      query: query,
      variables: { uuid: generateUuid() }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("returns an error if user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await apolloClient.query({
      query: query,
      variables: { uuid: generateUuid() }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("returns an error if user is a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: {
        approvalStatus: ApprovalStatus.rejected,
        admin: await AdminGenerator.instance(Secretary.extension)
      }
    });
    const { errors } = await apolloClient.query({
      query: query,
      variables: { uuid: generateUuid() }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });
});
