import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { MissingTranslationError } from "$models/Translation/Errors";

const GET_TRANSLATIONS = gql`
  query getTranslations($translationGroup: String!) {
    getTranslations(translationGroup: $translationGroup) {
      key
      value
    }
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
    expect(data).toEqual({
      getTranslations: [
        { key: "edit", value: "Editar" },
        { key: "padron", value: "Padron" },
        { key: "capabilities", value: "Aptitudes" }
      ]
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
    expect(errors![0].extensions!.data).toEqual({
      errorType: MissingTranslationError.name
    });
  });
});
