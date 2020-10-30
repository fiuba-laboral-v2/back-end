import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { UserRepository } from "$models/User";
import { CareerRepository } from "$models/Career";
import { Career } from "$models";

import { ApplicantGenerator } from "$generators/Applicant";
import { CareerGenerator } from "$generators/Career";
import { UUID_REGEX } from "$test/models";

const SAVE_APPLICANT_WITH_COMPLETE_DATA = gql`
  mutation SaveApplicant(
    $user: UserInput!
    $padron: Int!
    $careers: [ApplicantCareerInput]!
    $description: String
    $capabilities: [String]
  ) {
    saveApplicant(
      user: $user
      padron: $padron
      description: $description
      careers: $careers
      capabilities: $capabilities
    ) {
      uuid
      user {
        uuid
        email
        dni
        name
        surname
      }
      padron
      description
      capabilities {
        uuid
        description
      }
      careers {
        careerCode
        career {
          code
          description
        }
        approvedSubjectCount
        currentCareerYear
        isGraduate
      }
    }
  }
`;

const SAVE_APPLICANT_WITH_ONLY_OBLIGATORY_DATA = gql`
  mutation SaveApplicant($user: UserInput!, $padron: Int!, $careers: [ApplicantCareerInput]!) {
    saveApplicant(user: $user, padron: $padron, careers: $careers) {
      uuid
      user {
        email
      }
      padron
      careers {
        careerCode
      }
    }
  }
`;

describe("saveApplicant", () => {
  let career: Career;

  beforeAll(async () => {
    await CareerRepository.truncate();
    await UserRepository.truncate();
    career = await CareerGenerator.instance();
  });

  describe("when the input is valid", () => {
    it("creates a new applicant", async () => {
      const applicantData = ApplicantGenerator.data.minimum();
      const applicantCareerData = {
        careerCode: career.code,
        approvedSubjectCount: 20,
        currentCareerYear: 3,
        isGraduate: false
      };
      const { data, errors } = await client.loggedOut().mutate({
        mutation: SAVE_APPLICANT_WITH_COMPLETE_DATA,
        variables: {
          ...applicantData,
          careers: [applicantCareerData]
        }
      });
      expect(errors).toBeUndefined();
      expect(data!.saveApplicant).toEqual({
        uuid: expect.stringMatching(UUID_REGEX),
        user: {
          uuid: expect.stringMatching(UUID_REGEX),
          dni: applicantData.user.dni,
          email: applicantData.user.email,
          name: applicantData.user.name,
          surname: applicantData.user.surname
        },
        description: applicantData.description,
        padron: applicantData.padron,
        capabilities: [],
        careers: [
          {
            career: {
              code: career.code,
              description: career.description
            },
            ...applicantCareerData
          }
        ]
      });
    });

    it("creates applicant with only obligatory data", async () => {
      const applicantData = ApplicantGenerator.data.minimum();
      const applicantCareerData = {
        careerCode: career.code,
        isGraduate: true
      };
      const { data, errors } = await client.loggedOut().mutate({
        mutation: SAVE_APPLICANT_WITH_ONLY_OBLIGATORY_DATA,
        variables: { ...applicantData, careers: [applicantCareerData] }
      });
      expect(errors).toBeUndefined();
      expect(data!.saveApplicant).toEqual({
        uuid: expect.stringMatching(UUID_REGEX),
        user: { email: applicantData.user.email },
        padron: applicantData.padron,
        careers: [{ careerCode: applicantCareerData.careerCode }]
      });
    });
  });

  it("returns an error if it is not specified if the applicant is a graduate", async () => {
    const applicantData = ApplicantGenerator.data.minimum();

    const { errors } = await client.loggedOut().mutate({
      mutation: SAVE_APPLICANT_WITH_COMPLETE_DATA,
      variables: {
        ...applicantData,
        careers: [{ careerCode: career.code }]
      }
    });
    expect(errors).not.toBeUndefined();
  });

  it("returns an error if the user exists", async () => {
    const applicantData = ApplicantGenerator.data.minimum();
    await UserRepository.create(applicantData.user);
    const { errors } = await client.loggedOut().mutate({
      mutation: SAVE_APPLICANT_WITH_ONLY_OBLIGATORY_DATA,
      variables: applicantData
    });
    expect(errors).toIncludeGraphQLErrorType("UserEmailAlreadyExistsError");
  });
});
