import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";

const query = gql`
  query getTranslations($path: String!) {
    getTranslations(path: $path) {
      key
      value
    }
  }
`;

describe("getTranslations", () => {
  it("find translations given their path", async () => {
    const { data, errors } = await executeQuery(query, {
      path: "applicantProfileDetail"
    });

    expect(data).toEqual({
      getTranslations: [
        { key: "padron", value: "Padron" },
        { key: "capabilities", value: "Aptitudes" }
      ]
    });
  });

  it("return an error if a path doesn't exist", async () => {
    const { errors } = await executeQuery(query, {
      path: "falalala"
    });

    expect(errors).toHaveLength(1);
    expect(errors![0].message).toMatch(/Missing translation:/);
  });
});
