import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { Company } from "$models";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { IUpdateCompanyUser } from "$graphql/CompanyUser/Mutations/updateCompanyUser";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CompanyUserRepository } from "$models/CompanyUser";
import { CareerRepository } from "$models/Career";

import { CompanyUserGenerator } from "$generators/CompanyUser";
import { TestClientGenerator } from "$generators/TestClient";
import { EmailGenerator } from "$generators/Email";
import { UserGenerator } from "$generators/User";
import { CompanyGenerator } from "$generators/Company";
import { omit } from "lodash";

const UPDATE_COMPANY_USER = gql`
  mutation UpdateCompanyUser($user: CompanyUserUpdateInput!) {
    updateCompanyUser(user: $user) {
      uuid
      companyUuid
      userUuid
      position
      user {
        uuid
        email
        dni
        name
        surname
      }
    }
  }
`;

describe("updateCompanyUser", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const performQuery = (apolloClient: TestClient, variables: IUpdateCompanyUser) =>
    apolloClient.mutate({ mutation: UPDATE_COMPANY_USER, variables });

  const generateVariables = async (company: Company) => {
    const companyUser = await CompanyUserGenerator.instance({ company });
    const user = await UserRepository.findByUuid(companyUser.userUuid);
    const variables = {
      user: {
        uuid: user.uuid!,
        name: "newName",
        surname: "newSurname",
        email: EmailGenerator.generate(),
        position: "newPosition"
      }
    };
    return { variables, companyUser, user };
  };

  const expectToUpdateCompanyUser = async (status: ApprovalStatus) => {
    const { apolloClient, company } = await TestClientGenerator.company({ status });
    const { variables, companyUser } = await generateVariables(company);
    const { errors, data } = await performQuery(apolloClient, variables);
    expect(errors).toBeUndefined();
    expect(data!.updateCompanyUser).toEqual({
      uuid: companyUser.uuid,
      companyUuid: company.uuid,
      userUuid: companyUser.userUuid,
      position: variables.user.position,
      user: {
        uuid: companyUser.userUuid,
        ...omit(variables.user, ["position"]),
        dni: null
      }
    });
  };

  it("adds a company user to current user's approved company", async () => {
    await expectToUpdateCompanyUser(ApprovalStatus.approved);
  });

  it("adds a company user to current user's rejected company", async () => {
    await expectToUpdateCompanyUser(ApprovalStatus.rejected);
  });

  it("adds a company user to current user's pending company", async () => {
    await expectToUpdateCompanyUser(ApprovalStatus.pending);
  });

  it("returns an error if companyUser with the given email already exists", async () => {
    const { apolloClient, company } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
    const anotherUser = await UserGenerator.instance();
    const { variables } = await generateVariables(company);
    variables.user.email = anotherUser.email;
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("UserEmailAlreadyExistsError");
  });

  it("returns an error if the companyUser persistence fails", async () => {
    const { apolloClient, company } = await TestClientGenerator.company({
      status: ApprovalStatus.approved
    });
    const { variables, companyUser } = await generateVariables(company);
    jest.spyOn(CompanyUserRepository, "save").mockImplementation(() => {
      throw new Error();
    });
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType("Error");
    const persistedCompanyUser = await CompanyUserRepository.findByUserUuid(companyUser.userUuid);
    const persistedUser = await UserRepository.findByUuid(companyUser.userUuid);
    expect(persistedUser.email).not.toEqual(variables.user.email);
    expect(persistedUser.name).not.toEqual(variables.user.name);
    expect(persistedUser.surname).not.toEqual(variables.user.surname);
    expect(persistedCompanyUser.position).not.toEqual(variables.user.position);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const company = await CompanyGenerator.instance.withMinimumData();
    const { variables } = await generateVariables(company);
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is an approved applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.approved
    });
    const company = await CompanyGenerator.instance.withMinimumData();
    const { variables } = await generateVariables(company);
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.rejected
    });
    const company = await CompanyGenerator.instance.withMinimumData();
    const { variables } = await generateVariables(company);
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: ApprovalStatus.pending
    });
    const company = await CompanyGenerator.instance.withMinimumData();
    const { variables } = await generateVariables(company);
    const { errors } = await performQuery(apolloClient, variables);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
