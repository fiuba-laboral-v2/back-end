import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient } from "apollo-server-testing";

import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { TestClientGenerator } from "$generators/TestClient";

import { UserRepository } from "$models/User/Repository";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";

const UPDATE_PADRON = gql`
  mutation updatePadron($padron: Int!) {
    updatePadron(padron: $padron) {
      uuid
      padron
      approvalStatus
    }
  }
`;

describe("updatePadron", () => {
  beforeAll(async () => {
    await CareerRepository.truncate();
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  const updatePadron = (apolloClient: ApolloServerTestClient, padron: number) =>
    apolloClient.mutate({ mutation: UPDATE_PADRON, variables: { padron } });

  const expectToUpdatePadron = async (status: ApprovalStatus) => {
    const { apolloClient, applicant } = await TestClientGenerator.applicant({ status });
    const newPadron = 1234;
    const { data, errors } = await updatePadron(apolloClient, newPadron);
    expect(errors).toBeUndefined();
    expect(newPadron).not.toEqual(applicant.padron);
    expect(data!.updatePadron).toEqual({
      uuid: applicant.uuid,
      padron: newPadron,
      approvalStatus: ApprovalStatus.pending
    });
  };

  it("updates the padron by the current approved applicant and moves the applicant back to pending", async () => {
    await expectToUpdatePadron(ApprovalStatus.approved);
  });

  it("updates the padron by the current pending applicant and moves the applicant back to pending", async () => {
    await expectToUpdatePadron(ApprovalStatus.pending);
  });

  it("updates the padron by the current rejected applicant and moves the applicant back to pending", async () => {
    await expectToUpdatePadron(ApprovalStatus.rejected);
  });

  it("returns an error if no padron is given", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await updatePadron(apolloClient, null as any);
    expect(errors).not.toBeUndefined();
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await updatePadron(apolloClient, 123);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if current user is not an applicant", async () => {
    const { apolloClient } = await TestClientGenerator.user();
    const { errors } = await updatePadron(apolloClient, 123);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if current user is from a pending company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.pending });
    const { errors } = await updatePadron(apolloClient, 123);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if current user is from an approved company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.approved });
    const { errors } = await updatePadron(apolloClient, 123);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if current user is from a rejected company", async () => {
    const { apolloClient } = await TestClientGenerator.company({ status: ApprovalStatus.rejected });
    const { errors } = await updatePadron(apolloClient, 123);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if current user is an extension admin", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.extension });
    const { errors } = await updatePadron(apolloClient, 123);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if current user is a graduados admin", async () => {
    const { apolloClient } = await TestClientGenerator.admin({ secretary: Secretary.graduados });
    const { errors } = await updatePadron(apolloClient, 123);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
