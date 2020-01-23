import studentType from "./type";
import { ID } from "../fieldTypes";

const mockStudent = [{
  id: "001",
  name: "Bruno",
  surname: "Diaz",
  age: 30
}];

const studentQueries = {
  getStudentById: {
    type: studentType,
    args: {
      id: {
        type: ID
      }
    },
    resolve: (_: undefined, { id }: { id: string }) => {
      return mockStudent[parseInt(id, 10)];
    }
  }
};

export default studentQueries;
