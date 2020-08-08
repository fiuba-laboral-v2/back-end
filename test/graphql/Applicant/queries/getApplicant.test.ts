import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { CareerRepository } from "$models/Career";
import { ApplicantNotFound } from "$models/Applicant/Errors/ApplicantNotFound";
import { AuthenticationError } from "$graphql/Errors";

import { CareerGenerator, TCareerGenerator } from "$generators/Career";
import { TestClientGenerator } from "$generators/TestClient";
import generateUuid from "uuid/v4";
import { UserRepository } from "$models/User";
import { ApplicantGenerator } from "$generators/Applicant";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantRepository } from "$models/Applicant";
import { ExtensionAdminGenerator, TAdminGenerator } from "$generators/Admin";

const GET_APPLICANT = gql`
  query GetApplicant($uuid: ID!) {
    getApplicant(uuid: $uuid) {
      user {
        email
        name
        surname
      }
      padron
      description
      approvalStatus
      createdAt
      updatedAt
      capabilities {
        uuid
        description
      }
      careers {
        code
        description
        credits
        creditsCount
      }
    }
  }
`;

describe("getApplicant", () => {
  let careers: TCareerGenerator;
  let admins: TAdminGenerator;

  beforeAll(async () => {
    await CareerRepository.truncate();
    await UserRepository.truncate();
    careers = CareerGenerator.instance();
    admins = ExtensionAdminGenerator.instance();
  });

  describe("when the applicant exists", () => {
    it("fetches the applicant", async () => {
      const career = await careers.next().value;
      const applicantCareer = [{ code: career.code, creditsCount: 150 }];
      const {
        user,
        applicant,
        apolloClient
      } = await TestClientGenerator.applicant({ careers: applicantCareer });

      const { data, errors } = await apolloClient.query({
        query: GET_APPLICANT,
        variables: { uuid: applicant.uuid }
      });

      expect(errors).toBeUndefined();
      expect(data!.getApplicant).toMatchObject({
        user: {
          email: user.email,
          name: user.name,
          surname: user.surname
        },
        description: applicant.description,
        padron: applicant.padron,
        createdAt: applicant.createdAt.toISOString(),
        updatedAt: applicant.updatedAt.toISOString()
      });
      expect(data!.getApplicant).toHaveProperty("capabilities");
      expect(data!.getApplicant).toHaveProperty("careers");
      expect(data!.getApplicant.careers[0]).toMatchObject({
        code: career.code,
        credits: career.credits,
        description: career.description,
        creditsCount: applicantCareer[0].creditsCount
      });
    });

    it("returns the applicant's default approvalStatus", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const { data } = await apolloClient.query({
        query: GET_APPLICANT,
        variables: { uuid: applicant.uuid }
      });
      expect(data!.getApplicant.approvalStatus).toEqual(ApprovalStatus.pending);
    });

    it("returns the applicant's modified approvalStatus", async () => {
      const { apolloClient } = await TestClientGenerator.user();
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const admin = await admins.next().value;
      await ApplicantRepository.updateApprovalStatus(
        admin.userUuid,
        applicant.uuid,
        ApprovalStatus.rejected
      );
      const { data } = await apolloClient.query({
        query: GET_APPLICANT,
        variables: { uuid: applicant.uuid }
      });
      expect(data!.getApplicant.approvalStatus).toEqual(ApprovalStatus.rejected);
    });
  });

  describe("when the applicant doesn't exists", () => {
    it("returns an error if the applicant does not exist", async () => {
      const { apolloClient } = await TestClientGenerator.user();

      const uuid = generateUuid();
      const { errors } = await apolloClient.query({
        query: GET_APPLICANT,
        variables: { uuid }
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: ApplicantNotFound.name });
    });
  });

  describe("Errors", () => {
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();
      const uuid = generateUuid();
      const { errors } = await apolloClient.query({
        query: GET_APPLICANT,
        variables: { uuid: uuid }
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });
  });
});
