import adminType from "./type";
import { ID } from "../field_types";

const mockAdmin = [{
  id: "0",
  name: "Bruno",
  surname: "Diaz",
  age: 30
}];

const adminQueries = {
  getAdminById: {
    type: adminType,
    args: {
      id: {
        type: ID
      }
    },
    resolve: (_: undefined, { id }: { id: string }) => {
      return mockAdmin[parseInt(id, 10)];
    }
  }
};

export default adminQueries;
