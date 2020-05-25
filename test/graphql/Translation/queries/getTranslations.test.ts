import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import { MissingTranslationError } from "../../../../src/models/Translation/Errors";

const query = gql`
  query getTranslations($translationGroup: String!) {
    getTranslations(translationGroup: $translationGroup) {
      key
      value
    }
  }
`;

describe("getTranslations", () => {
  it("find translations given their translationGroup", async () => {
    const { data, errors } = await executeQuery(query, {
      translationGroup: "applicantProfileDetail"
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

  it("should return an error if a translationGroup doesn't exist", async () => {
    const { errors } = await executeQuery(query, { translationGroup: "falalala" });

    expect(errors).toHaveLength(1);
    expect(errors![0].extensions!.data).toEqual({ errorType: MissingTranslationError.name });
  });
});
