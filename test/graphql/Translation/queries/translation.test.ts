import { gql } from "apollo-server";
import { executeQuery } from "../../apolloTestClient";

const query = gql`
  query ($path: String!) {
    translation(path: $path)
  }
`;

test("find a translation given its path", async () => {
  const { data } = await executeQuery(query, { path: "applicant.apply" });

  expect(data).toEqual({
    translation: "Postularme"
  });
});

test("return an error if the path doesn't exist", async () => {
  const { errors } = await executeQuery(query, { path: "notExistingPath" });

  expect(errors).toHaveLength(1);
  expect(errors![0].message).toMatch(/Missing translation:/);
});
