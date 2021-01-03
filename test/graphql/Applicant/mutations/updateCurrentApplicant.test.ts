import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";

import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { CareerGenerator } from "$generators/Career";
import { TestClientGenerator } from "$generators/TestClient";

import { UserRepository } from "$models/User/Repository";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

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
  beforeAll(async () => {
    await CareerRepository.truncate();
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  it("updates all possible data deleting all previous values", async () => {
    const { user, apolloClient } = await TestClientGenerator.applicant();
    const newCareer = await CareerGenerator.instance();
    const dataToUpdate = {
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

    const { data, errors } = await apolloClient.mutate({
      mutation: UPDATE_CURRENT_APPLICANT,
      variables: dataToUpdate
    });

    expect(errors).toBeUndefined();
    const updatedApplicantData = data!.updateCurrentApplicant;
    expect(updatedApplicantData).toBeObjectContaining({
      user: {
        uuid: user.uuid,
        email: dataToUpdate.user.email,
        name: dataToUpdate.user.name,
        surname: dataToUpdate.user.surname
      },
      description: dataToUpdate.description,
      capabilities: expect.arrayContaining(
        dataToUpdate.capabilities.map(description => ({ description }))
      ),
      careers: [
        {
          career: {
            code: newCareer.code,
            description: newCareer.description
          },
          ...dataToUpdate.careers[0]
        }
      ],
      knowledgeSections: dataToUpdate.knowledgeSections,
      experienceSections: dataToUpdate.experienceSections,
      links: dataToUpdate.links
    });
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

      const dataToUpdate = {
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
        variables: dataToUpdate
      });

      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("returns an error if current user is not an applicant", async () => {
      const { apolloClient } = await TestClientGenerator.user();

      const dataToUpdate = {
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
        variables: dataToUpdate
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
