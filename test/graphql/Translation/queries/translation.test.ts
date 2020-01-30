import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";

const query = gql`
  query ($path: String!) {
    translation(path: $path)
  }
`;

test("find a translation given its path", async () => {
  const { data } = await executeQuery(query, { path: "app.title" });

  expect(data).toEqual({
    translation: "Bolsa de trabajo"
  });
});

test("return an error if the path doesn't exist", async () => {
  const { errors } = await executeQuery(query, { path: "notExistingPath" });

  expect(errors).toHaveLength(1);
  expect(errors![0].message).toMatch(/Missing translation:/);
});
