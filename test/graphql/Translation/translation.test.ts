import { gql } from "apollo-server";
import client from "../apollo_test_client";

const GET_TRANSLATION = gql`
  query GetTranslation($path: String!) {
    translation(path: $path)
  }
`;

describe("Translation query", () => {
  it("should find a translation given the path", async () => {
    const { data } = await client.query({
      query: GET_TRANSLATION,
      variables: { path: "applicant.apply" }
    });

    expect(data).toEqual({
      translation: "Postularme"
    });
  });

  it("should return an error if the path doesn't exist", async () => {
    const { errors } = await client.query({
      query: GET_TRANSLATION,
      variables: { path: "notExistingPath" }
    });

    expect(errors).toHaveLength(1);
    expect(errors![0].message).toMatch(/Missing translation:/);
  });
});
