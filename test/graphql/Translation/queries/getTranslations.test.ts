import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { MissingTranslationError } from "$models/Translation/Errors";

const GET_TRANSLATIONS = gql`
  query getTranslations($translationGroup: String!) {
    getTranslations(translationGroup: $translationGroup)
  }
`;

describe("getTranslations", () => {
  it("finds translations given their translationGroup", async () => {
    const { data, errors } = await client.loggedOut().query({
      query: GET_TRANSLATIONS,
      variables: {
        translationGroup: "applicantProfileDetail"
      }
    });

    expect(errors).toBeUndefined();
    expect(data!.getTranslations).toEqual({
      edit: "Editar",
      padron: "Padron",
      capabilities: "Aptitudes"
    });
  });

  it("returns an error if a translationGroup doesn't exist", async () => {
    const { errors } = await client.loggedOut().query({
      query: GET_TRANSLATIONS,
      variables: {
        translationGroup: "falalala"
      }
    });

    expect(errors).toHaveLength(1);
    expect(errors).toEqualGraphQLErrorType(MissingTranslationError.name);
  });
});
