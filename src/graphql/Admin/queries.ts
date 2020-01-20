import adminType from "./type";
import { GraphQLID } from "graphql";

const mockAdmin = [{
  id: "001",
  name: "Bruno",
  surname: "Diaz",
  age: 30
}];

const adminQueries = {
  getAdminById: {
    type: adminType,
    args: {
      id: {
        type: GraphQLID
      }
    },
    resolve: ({}, { id }: { id: string }) => {
      return mockAdmin[parseInt(id, 10)];
    }
  }
};

export default adminQueries;
