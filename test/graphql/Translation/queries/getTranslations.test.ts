import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";

const query = gql`
  query getTranslations($paths: [String!]!) {
    getTranslations(paths: $paths)
  }
`;

describe("getTranslations", () => {
  it("find translations given their path", async () => {
    const { data } = await executeQuery(query, { paths: ["app.title", "companies"] });

    expect(data).toEqual({
      getTranslations: ["Bolsa de trabajo", "Empresas"]
    });
  });

  it("return an error if a path doesn't exist", async () => {
    const { errors } = await executeQuery(query, { paths: ["app.title", "notExistingPath"] });

    expect(errors).toHaveLength(1);
    expect(errors![0].message).toMatch(/Missing translation:/);
  });

});
