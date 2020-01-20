import studentType from "./type";
import { GraphQLID } from "graphql";

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
        type: GraphQLID
      }
    },
    resolve: ({}, { id }: { id: string }) => {
      return mockStudent[parseInt(id, 10)];
    }
  }
};

export default studentQueries;
