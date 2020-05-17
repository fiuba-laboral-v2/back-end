import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { Career } from "../../../../src/models/Career";

import { careerMocks } from "../../../models/Career/mocks";
import { loginFactory } from "../../../mocks/login";

import { UserRepository } from "../../../../src/models/User/Repository";
import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";

const UPDATE_APPLICANT = gql`
  mutation updateApplicant(
    $uuid: ID!, $padron: Int, $user: UserUpdateInput, $description: String,
    $careers: [CareerCredits], $capabilities: [String], $sections: [SectionInput],
    $links: [LinkInput]
  ) {
    updateApplicant(
      uuid: $uuid, padron: $padron, user: $user, description: $description,
      careers: $careers, capabilities: $capabilities, sections: $sections, links: $links
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

describe("updateApplicant", () => {
  beforeAll(async () => {
    await Database.setConnection();
    await Career.truncate({ cascade: true });
    await UserRepository.truncate();
  });

  afterAll(async () => {
    await Career.truncate({ cascade: true });
    await UserRepository.truncate();
    Database.close();
  });

  it("should update all possible data deleting all previous values", async () => {
    const { applicant, user, apolloClient } = await loginFactory.applicant();
    const newCareer = await CareerRepository.create(careerMocks.careerData());
    const dataToUpdate = {
      uuid: applicant.uuid,
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
      mutation: UPDATE_APPLICANT,
      variables: dataToUpdate
    });

    expect(errors).toBeUndefined();
    expect(data!.updateApplicant).toMatchObject({
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
      data!.updateApplicant.capabilities.map(c => c.description)
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.capabilities
      ]
    ));
    expect(
      data!.updateApplicant.careers.map(c => c.code)
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.careers.map(c => c.code)
      ]
    ));
    expect(
      data!.updateApplicant.sections.map(({ title, text, displayOrder }) =>
        ({ title, text, displayOrder })
      )
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.sections.map(({ title, text, displayOrder }) =>
          ({ title, text, displayOrder }))
      ]
    ));
    expect(
      data!.updateApplicant.links.map(({ name, url }) => ({ name, url })
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
        uuid: "4d4473fb-ba85-40dc-81c5-12d1814c98fa",
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
        mutation: UPDATE_APPLICANT,
        variables: dataToUpdate
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("should return an error if current user is not an applicant", async () => {
      const { apolloClient } = await loginFactory.user();

      const dataToUpdate = {
        uuid: "4d4473fb-ba85-40dc-81c5-12d1814c98fa",
        user: {
          name: "newName",
          surname: "newSurname"
        },
        padron: 1500,
        description: "newDescription",
        capabilities: ["CSS", "clojure"]
      };

      const { errors } = await apolloClient.mutate({
        mutation: UPDATE_APPLICANT,
        variables: dataToUpdate
      });

      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});
