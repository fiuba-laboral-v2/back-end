import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ISaveApplicant } from "$graphql/Applicant/Mutations/saveApplicant";

import { UserRepository, User, BadCredentialsError } from "$models/User";
import { FiubaCredentials } from "$models/User/Credentials";
import { CareerRepository } from "$models/Career";
import { Career } from "$models";
import { FiubaUsersService } from "$services";

import { ApplicantGenerator } from "$generators/Applicant";
import { AdminGenerator } from "$generators/Admin";
import { CareerGenerator } from "$generators/Career";
import { UUID_REGEX } from "$test/models";
import { DniGenerator } from "$generators/DNI";
import { omit } from "lodash";

const SAVE_APPLICANT = gql`
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
        description
      }
      careers {
        careerCode
        career {
          code
        }
        approvedSubjectCount
        currentCareerYear
        isGraduate
      }
    }
  }
`;

describe("saveApplicant", () => {
  let firstCareer: Career;
  let secondCareer: Career;

  beforeAll(async () => {
    await CareerRepository.truncate();
    await UserRepository.truncate();
    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();
  });

  const saveApplicant = (variables: ISaveApplicant) =>
    client.loggedOut().mutate({ mutation: SAVE_APPLICANT, variables });

  const expectToSaveApplicant = async (variables: ISaveApplicant) => {
    const { data, errors } = await saveApplicant(variables);

    expect(errors).toBeUndefined();
    expect(data!.saveApplicant).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...omit(variables, ["careers", "user", "capabilities"]),
      user: {
        uuid: expect.stringMatching(UUID_REGEX),
        ...omit(variables.user, "password")
      },
      capabilities: expect.arrayContaining(
        (variables.capabilities || []).map(description => ({ description }))
      ),
      careers: variables.careers.map(applicantCareer => ({
        ...applicantCareer,
        approvedSubjectCount: applicantCareer.approvedSubjectCount || null,
        currentCareerYear: applicantCareer.currentCareerYear || null,
        career: {
          code: applicantCareer.careerCode
        }
      }))
    });
  };

  it("creates a new student", async () => {
    await expectToSaveApplicant({
      ...ApplicantGenerator.data.minimum(),
      careers: [
        {
          careerCode: firstCareer.code,
          approvedSubjectCount: 20,
          currentCareerYear: 3,
          isGraduate: false
        }
      ]
    });
  });

  it("creates a new graduate", async () => {
    await expectToSaveApplicant({
      ...ApplicantGenerator.data.minimum(),
      careers: [
        {
          careerCode: firstCareer.code,
          isGraduate: true
        }
      ]
    });
  });

  it("creates a new student and graduate", async () => {
    await expectToSaveApplicant({
      ...ApplicantGenerator.data.minimum(),
      careers: [
        {
          careerCode: firstCareer.code,
          approvedSubjectCount: 20,
          currentCareerYear: 3,
          isGraduate: false
        },
        {
          careerCode: secondCareer.code,
          isGraduate: true
        }
      ]
    });
  });

  it("creates an applicant that was already an admin", async () => {
    const admin = await AdminGenerator.graduados();
    const user = await UserRepository.findByUuid(admin.userUuid);
    await expectToSaveApplicant({
      ...ApplicantGenerator.data.minimum(),
      user: {
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: "mySecret",
        dni: (user.credentials as FiubaCredentials).dni
      },
      careers: [
        {
          careerCode: firstCareer.code,
          isGraduate: true
        }
      ]
    });
  });

  it("creates an applicant with capabilities", async () => {
    await expectToSaveApplicant({
      ...ApplicantGenerator.data.minimum(),
      careers: [{ careerCode: secondCareer.code, isGraduate: true }],
      capabilities: ["Java", "Python", "clojure"]
    });
  });

  it("returns an error if it is not specified if the applicant is a graduate", async () => {
    const applicantData = ApplicantGenerator.data.minimum();
    const variables = { ...applicantData, careers: [{ careerCode: firstCareer.code }] };
    const { errors } = await saveApplicant(variables as ISaveApplicant);
    expect(errors).not.toBeUndefined();
  });

  it("returns an error if the user email exists", async () => {
    const applicantData = ApplicantGenerator.data.minimum();
    const fiubaCredentials = new FiubaCredentials(DniGenerator.generate());
    const user = new User({ ...applicantData.user, credentials: fiubaCredentials });
    await UserRepository.save(user);
    const { errors } = await saveApplicant(applicantData);
    expect(errors).toEqualGraphQLErrorType("UserEmailAlreadyExistsError");
  });

  it("returns an error if the Fiuba authentication fails", async () => {
    const applicantData = ApplicantGenerator.data.minimum();
    jest.spyOn(FiubaUsersService, "authenticate").mockImplementation(async () => false);
    const { errors } = await saveApplicant(applicantData);
    expect(errors).toEqualGraphQLErrorType(BadCredentialsError.name);
  });
});
