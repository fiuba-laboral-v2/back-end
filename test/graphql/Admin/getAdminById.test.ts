import { gql } from "apollo-server";
import client from "../apollo_test_client";

describe("Admin Endpoints", () => {
  it("should find an admin by its id", async () => {
    const { data } = await client.query({
      query: gql`
        query MyQuery($id: ID) {
          getAdminById(id: $id) {
            id
            name
            age
          }
        }
      `,
      variables: { id: "0" }
    });

    expect(data).toEqual({
      getAdminById: {
        age: 30,
        id: "0",
        name: "Bruno"
      }
    });
  });
});
