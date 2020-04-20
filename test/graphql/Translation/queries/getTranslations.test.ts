import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";

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

    expect(data).toEqual({
      getTranslations: [
        { key: "padron", value: "Padron" },
        { key: "capabilities", value: "Aptitudes" }
      ]
    });
  });

  it("return an error if a translationGroup doesn't exist", async () => {
    const { errors } = await executeQuery(query, {
      translationGroup: "falalala"
    });

    expect(errors).toHaveLength(1);
    expect(errors![0].message).toMatch(/Missing translation:/);
  });
});
