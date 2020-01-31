import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";

const query = gql`
  query ($paths: [String!]!) {
    getTranslations(paths: $paths)
  }
`;

test("find translations given their path", async () => {
  const { data } = await executeQuery(query, { paths: ["app.title", "my_company"] });

  expect(data).toEqual({
    getTranslations: ["Bolsa de trabajo", "Mi empresa"]
  });
});

test("return an error if a path doesn't exist", async () => {
  const { errors } = await executeQuery(query, { paths: ["app.title", "notExistingPath"] });

  expect(errors).toHaveLength(1);
  expect(errors![0].message).toMatch(/Missing translation:/);
});
