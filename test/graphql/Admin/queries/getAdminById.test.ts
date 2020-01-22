import { gql } from "apollo-server";
import { executeQuery } from "../../apolloTestClient";

const query = gql`
  query ($id: ID) {
    getAdminById(id: $id) {
      id
      name
      age
    }
  }
`;

test("find an admin by its id", async () => {
  const { data } = await executeQuery(query, { id: "0" });

  expect(data).toEqual({
    getAdminById: {
      age: 30,
      id: "0",
      name: "Bruno"
    }
  });
});
