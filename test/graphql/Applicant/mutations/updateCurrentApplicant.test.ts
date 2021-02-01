import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { CareerGenerator } from "$generators/Career";
import { TestClientGenerator } from "$generators/TestClient";

import { UserRepository } from "$models/User/Repository";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantRepository, IApplicantEditable } from "$models/Applicant";
import { get, set } from "lodash";
import { ApplicantGenerator } from "$generators/Applicant";
import { CurrentUserBuilder } from "$models/CurrentUser";
import { Applicant, Career } from "$models";

const UPDATE_CURRENT_APPLICANT = gql`
  mutation updateCurrentApplicant(
    $user: UserUpdateInput
    $description: String
    $careers: [ApplicantCareerInput]
    $capabilities: [String]
    $knowledgeSections: [ApplicantKnowledgeSectionInput]
    $experienceSections: [ApplicantExperienceSectionInput]
    $links: [LinkInput]
  ) {
    updateCurrentApplicant(
      user: $user
      description: $description
      careers: $careers
      capabilities: $capabilities
      knowledgeSections: $knowledgeSections
      experienceSections: $experienceSections
      links: $links
    ) {
      user {
        uuid
        email
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
          description
        }
        approvedSubjectCount
        currentCareerYear
        isGraduate
      }
      knowledgeSections {
        title
        text
        displayOrder
      }
      experienceSections {
        title
        text
        displayOrder
      }
      links {
        name
        url
      }
    }
  }
`;

describe("updateCurrentApplicant", () => {
  let firstCareer: Career;
  let secondCareer: Career;
  let thirdCareer: Career;

  beforeAll(async () => {
    await CareerRepository.truncate();
    await UserRepository.truncate();
    await CompanyRepository.truncate();

    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();
    thirdCareer = await CareerGenerator.instance();
  });

  const login = (applicant: Applicant) =>
    client.loggedIn({
      currentUser: CurrentUserBuilder.build({
        uuid: applicant.userUuid,
        applicant: { uuid: applicant.uuid }
      })
    });

  const updateCurrentApplicant = async (
    apolloClient: TestClient,
    variables: Omit<IApplicantEditable, "uuid">
  ) => apolloClient.mutate({ mutation: UPDATE_CURRENT_APPLICANT, variables });

  const expectToUpdateAttribute = async (attributeName: string, value: string) => {
    const { user, apolloClient } = await TestClientGenerator.applicant();
    let variables = { user: { name: user.name, surname: user.surname, email: user.email } };
    variables = set(variables, attributeName, value);
    const { errors, data } = await updateCurrentApplicant(apolloClient, variables);
    expect(errors).toBeUndefined();
    expect(get(data!.updateCurrentApplicant, attributeName)).toEqual(value);
  };

  it("updates all possible data deleting all previous values", async () => {
    const { applicant, apolloClient } = await TestClientGenerator.applicant();
    const newCareer = await CareerGenerator.instance();
    const variables = {
      user: {
        email: "newEmail@gmail.com",
        name: "newName",
        surname: "newSurname"
      },
      description: "newDescription",
      capabilities: ["CSS", "clojure"],
      careers: [
        {
          careerCode: newCareer.code,
          approvedSubjectCount: 20,
          currentCareerYear: 3,
          isGraduate: false
        }
      ],
      knowledgeSections: [
        {
          title: "title",
          text: "description",
          displayOrder: 1
        }
      ],
      experienceSections: [
        {
          title: "Devartis",
          text: "I was the project manager",
          displayOrder: 1
        },
        {
          title: "Google",
          text: "I am the CEO of google in ireland",
          displayOrder: 2
        }
      ],
      links: [
        {
          name: "my link",
          url: "https://some.url"
        }
      ]
    };

    const { data, errors } = await updateCurrentApplicant(apolloClient, variables);
    expect(errors).toBeUndefined();
    const updatedApplicantData = data!.updateCurrentApplicant;
    expect(updatedApplicantData).toBeObjectContaining({
      user: {
        uuid: applicant.userUuid,
        email: variables.user.email,
        name: variables.user.name,
        surname: variables.user.surname
      },
      description: variables.description,
      capabilities: expect.arrayContaining(
        variables.capabilities.map(description => ({ description }))
      ),
      careers: [
        {
          career: {
            code: newCareer.code,
            description: newCareer.description
          },
          ...variables.careers[0]
        }
      ],
      knowledgeSections: variables.knowledgeSections,
      experienceSections: variables.experienceSections,
      links: variables.links
    });
  });

  it("updates name", async () => {
    await expectToUpdateAttribute("user.name", "newName");
  });

  it("updates surname", async () => {
    await expectToUpdateAttribute("user.surname", "newSurname");
  });

  it("updates email", async () => {
    await expectToUpdateAttribute("user.email", "aNewEmail@gmail.com");
  });

  it("updates description", async () => {
    await expectToUpdateAttribute("description", "newDescription");
  });

  it("updates by adding new capabilities", async () => {
    const capabilities = ["CSS", "clojure"];
    const { apolloClient } = await TestClientGenerator.applicant({ capabilities });
    const variables = { capabilities: ["Python", "clojure"] };
    const { data, errors } = await updateCurrentApplicant(apolloClient, variables);
    expect(errors).toBeUndefined();
    expect(data!.updateCurrentApplicant.capabilities.map(({ description }) => description)).toEqual(
      expect.arrayContaining(variables.capabilities.map(description => description.toLowerCase()))
    );
  });

  it("updates by deleting all capabilities if none is provided", async () => {
    const capabilities = ["CSS", "clojure"];
    const { apolloClient } = await TestClientGenerator.applicant({ capabilities });
    const { data, errors } = await updateCurrentApplicant(apolloClient, {});
    expect(errors).toBeUndefined();
    expect(data!.updateCurrentApplicant.capabilities).toEqual([]);
  });

  it("updates by keeping only the new careers", async () => {
    const applicant = await ApplicantGenerator.instance.studentAndGraduate({
      careerInProgress: firstCareer,
      finishedCareer: secondCareer
    });
    const apolloClient = login(applicant);
    const careerCodes = (await applicant.getCareers()).map(({ code }) => code);
    expect(careerCodes).toEqual(expect.arrayContaining([firstCareer.code, secondCareer.code]));
    const variables = {
      careers: [
        {
          careerCode: thirdCareer.code,
          isGraduate: true
        },
        {
          careerCode: secondCareer.code,
          isGraduate: true
        }
      ]
    };
    const { data, errors } = await updateCurrentApplicant(apolloClient, variables);
    expect(errors).toBeUndefined();
    const newCareerCodes = data!.updateCurrentApplicant.careers.map(({ careerCode }) => careerCode);
    expect(newCareerCodes).toEqual(expect.arrayContaining([secondCareer.code, thirdCareer.code]));
  });

  it("moves the applicant back to pending if it was rejected", async () => {
    const status = ApprovalStatus.rejected;
    const { apolloClient, applicant } = await TestClientGenerator.applicant({ status });
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_CURRENT_APPLICANT,
      variables: { description: "newDescription" }
    });
    expect(errors).toBeUndefined();
    const updatedApplicant = await ApplicantRepository.findByUuid(applicant.uuid);
    expect(updatedApplicant.approvalStatus).toEqual(ApprovalStatus.pending);
  });

  it("does not update the approvalStatus if it was pending", async () => {
    const status = ApprovalStatus.pending;
    const { apolloClient, applicant } = await TestClientGenerator.applicant({ status });
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_CURRENT_APPLICANT,
      variables: { description: "newDescription" }
    });
    expect(errors).toBeUndefined();
    const updatedApplicant = await ApplicantRepository.findByUuid(applicant.uuid);
    expect(updatedApplicant.approvalStatus).toEqual(status);
  });

  it("does not update the approvalStatus if it was approved", async () => {
    const status = ApprovalStatus.approved;
    const { apolloClient, applicant } = await TestClientGenerator.applicant({ status });
    const { errors } = await apolloClient.mutate({
      mutation: UPDATE_CURRENT_APPLICANT,
      variables: { description: "newDescription" }
    });
    expect(errors).toBeUndefined();
    const updatedApplicant = await ApplicantRepository.findByUuid(applicant.uuid);
    expect(updatedApplicant.approvalStatus).toEqual(status);
  });

  describe("Errors", () => {
    it("returns an error if isGraduate is true and currentCareerYear is set", async () => {
      const { apolloClient } = await TestClientGenerator.applicant();
      const { code: careerCode } = await CareerGenerator.instance();
      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_CURRENT_APPLICANT,
        variables: {
          careers: [
            {
              careerCode,
              currentCareerYear: 3,
              isGraduate: true
            }
          ]
        }
      });

      expect(errors).not.toBeUndefined();
    });
    it("returns an error if there is no current user", async () => {
      const apolloClient = client.loggedOut();

      const variables = {
        user: {
          email: "newEmail@gmail.com",
          name: "newName",
          surname: "newSurname"
        },
        description: "newDescription",
        capabilities: ["CSS", "clojure"]
      };

      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_CURRENT_APPLICANT,
        variables: variables
      });

      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if current user is not an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.user();

      const variables = {
        user: {
          email: "newEmail@gmail.com",
          name: "newName",
          surname: "newSurname"
        },
        description: "newDescription",
        capabilities: ["CSS", "clojure"]
      };

      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_CURRENT_APPLICANT,
        variables: variables
      });

      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if current user is from a company", async () => {
      const { apolloClient } = await TestClientGenerator.company();
      const { errors } = await apolloClient.mutate({ mutation: UPDATE_CURRENT_APPLICANT });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
