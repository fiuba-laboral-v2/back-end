import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { CareerGenerator, TCareerGenerator } from "../../../generators/Career";
import { testClientFactory } from "../../../mocks/testClientFactory";

import { UserRepository } from "../../../../src/models/User/Repository";
import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

const UPDATE_CURRENT_APPLICANT = gql`
  mutation updateCurrentApplicant(
    $padron: Int,
    $user: UserUpdateInput,
    $description: String,
    $careers: [CareerCredits],
    $capabilities: [String],
    $sections: [SectionInput],
    $links: [LinkInput]
  ) {
    updateCurrentApplicant(
      padron: $padron,
      user: $user,
      description: $description,
      careers: $careers,
      capabilities: $capabilities,
      sections: $sections,
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
        code
        description
        credits
        creditsCount
      }
      sections {
        uuid
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
  let careers: TCareerGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    careers = CareerGenerator.model();
  });

  afterAll(() => Database.close());

  it("should update all possible data deleting all previous values", async () => {
    const { applicant, user, apolloClient } = await testClientFactory.applicant();
    const newCareer = await careers.next().value;
    const dataToUpdate = {
      user: {
        name: "newName",
        surname: "newSurname"
      },
      padron: applicant.padron,
      description: "newDescription",
      capabilities: ["CSS", "clojure"],
      careers: [
        {
          code: newCareer.code,
          creditsCount: 8
        }
      ],
      sections: [
        {
          title: "title",
          text: "description",
          displayOrder: 1
        }
      ],
      links: [
        {
          name: "my link",
          url: "https://some.url"
        }
      ]
    };

    const {
      data, errors
    } = await apolloClient.mutate({
      mutation: UPDATE_CURRENT_APPLICANT,
      variables: dataToUpdate
    });

    expect(errors).toBeUndefined();
    expect(data!.updateCurrentApplicant).toMatchObject({
      padron: dataToUpdate.padron,
      user: {
        uuid: user.uuid,
        email: user.email,
        name: dataToUpdate.user.name,
        surname: dataToUpdate.user.surname
      },
      description: dataToUpdate.description
    });
    expect(
      data!.updateCurrentApplicant.capabilities.map(c => c.description)
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.capabilities
      ]
    ));
    expect(
      data!.updateCurrentApplicant.careers.map(c => c.code)
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.careers.map(c => c.code)
      ]
    ));
    expect(
      data!.updateCurrentApplicant.sections.map(({ title, text, displayOrder }) =>
        ({ title, text, displayOrder })
      )
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.sections.map(({ title, text, displayOrder }) =>
          ({ title, text, displayOrder }))
      ]
    ));
    expect(
      data!.updateCurrentApplicant.links.map(({ name, url }) => ({ name, url })
      )
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.links.map(({ name, url }) => ({ name, url }))
      ]
    ));
  });

  describe("Errors", () => {
    it("should return an error if there is no current user", async () => {
      const apolloClient = client.loggedOut;

      const dataToUpdate = {
        user: {
          name: "newName",
          surname: "newSurname"
        },
        padron: 1500,
        description: "newDescription",
        capabilities: ["CSS", "clojure"]
      };

      const {
       errors
      } = await apolloClient.mutate({
        mutation: UPDATE_CURRENT_APPLICANT,
        variables: dataToUpdate
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("should return an error if current user is not an applicant", async () => {
      const { apolloClient } = await testClientFactory.user();

      const dataToUpdate = {
        user: {
          name: "newName",
          surname: "newSurname"
        },
        padron: 1500,
        description: "newDescription",
        capabilities: ["CSS", "clojure"]
      };

      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_CURRENT_APPLICANT,
        variables: dataToUpdate
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});
