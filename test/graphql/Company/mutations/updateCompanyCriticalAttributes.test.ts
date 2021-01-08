import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";
import { IUpdateCompanyCriticalAttributes } from "$graphql/Company/Mutations/updateCompanyCriticalAttributes";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { CareerRepository } from "$models/Career";

import { TestClientGenerator } from "$generators/TestClient";
import { CuitGenerator } from "$generators/Cuit";
import { BusinessNameGenerator } from "$generators/BusinessName";
import { CompanyGenerator } from "$generators/Company";

const UPDATE_COMPANY_CRITICAL_ATTRIBUTES = gql`
  mutation UpdateCompanyCriticalAttributes($cuit: String!, $businessName: String!) {
    updateCompanyCriticalAttributes(cuit: $cuit, businessName: $businessName) {
      uuid
      cuit
      businessName
    }
  }
`;

describe("updateCompanyCriticalAttributes", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const generateVariables = () => ({
    cuit: CuitGenerator.generate(),
    businessName: BusinessNameGenerator.generate()
  });

  const updateCompanyCriticalAttributes = (
    apolloClient: TestClient,
    variables: IUpdateCompanyCriticalAttributes
  ) => apolloClient.mutate({ mutation: UPDATE_COMPANY_CRITICAL_ATTRIBUTES, variables });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: approvalStatus });

  const expectToMoveCompanyBackToPending = async (status: ApprovalStatus) => {
    const { apolloClient, company } = await TestClientGenerator.company({ status });
    const variables = generateVariables();
    const { errors } = await updateCompanyCriticalAttributes(apolloClient, variables);
    expect(errors).toBeUndefined();
    const persistedCompany = await CompanyRepository.findByUuid(company.uuid);
    expect(persistedCompany.approvalStatus).toEqual(ApprovalStatus.pending);
  };

  const expectToUpdateCuitAndBusinessName = async (status: ApprovalStatus) => {
    const { apolloClient, company } = await TestClientGenerator.company({ status });
    const variables = generateVariables();
    const { data, errors } = await updateCompanyCriticalAttributes(apolloClient, variables);
    expect(errors).toBeUndefined();
    expect(data!.updateCompanyCriticalAttributes).toEqual({
      uuid: company.uuid,
      ...variables
    });
  };

  it("updates the cuit and the businessName by the current user from an approved company", async () => {
    await expectToUpdateCuitAndBusinessName(ApprovalStatus.approved);
  });

  it("updates the cuit and the businessName by the current user from a rejected company", async () => {
    await expectToUpdateCuitAndBusinessName(ApprovalStatus.rejected);
  });

  it("updates the cuit and the businessName by the current user from a pending company", async () => {
    await expectToUpdateCuitAndBusinessName(ApprovalStatus.pending);
  });

  it("moves back the company to pending by the current user from an approved company", async () => {
    await expectToMoveCompanyBackToPending(ApprovalStatus.approved);
  });

  it("moves back the company to pending by the current user from an pending company", async () => {
    await expectToMoveCompanyBackToPending(ApprovalStatus.pending);
  });

  it("moves back the company to pending by the current user from an rejected company", async () => {
    await expectToMoveCompanyBackToPending(ApprovalStatus.rejected);
  });

  it("returns an error if the businessName alreadyExists", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.approved });
    const anotherCompany = await CompanyGenerator.instance.withMinimumData();
    const variables = {
      cuit: CuitGenerator.generate(),
      businessName: anotherCompany.businessName
    };
    const { errors } = await updateCompanyCriticalAttributes(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("BusinessNameAlreadyExistsError");
  });

  it("returns an error if the cuit alreadyExists", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.approved });
    const anotherCompany = await CompanyGenerator.instance.withMinimumData();
    const variables = {
      cuit: anotherCompany.cuit,
      businessName: BusinessNameGenerator.generate()
    };
    const { errors } = await updateCompanyCriticalAttributes(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("CompanyCuitAlreadyExistsError");
  });

  it("throws an error if current user is not a company user", async () => {
    const { apolloClient } = await TestClientGenerator.user();
    const { errors } = await updateCompanyCriticalAttributes(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await updateCompanyCriticalAttributes(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is a approved applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.approved);
    const { errors } = await updateCompanyCriticalAttributes(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.rejected);
    const { errors } = await updateCompanyCriticalAttributes(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.pending);
    const { errors } = await updateCompanyCriticalAttributes(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an extension admin", async () => {
    const secretary = Secretary.extension;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await updateCompanyCriticalAttributes(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a graduados admin", async () => {
    const secretary = Secretary.graduados;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await updateCompanyCriticalAttributes(apolloClient, generateVariables());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
