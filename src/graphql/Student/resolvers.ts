"use strict";

import property from "lodash/property";

const mockStudent = [{
  id: "001",
  name: "Bruno",
  surname: "Diaz",
  age: 30
}];

export = {
  Student: {
    id: property("id"),
    name: property("name"),
    surname: property("surname"),
    age: property("id")
  },
  Query: {
    getStudentById: (id: string) => {
      return mockStudent[0];
    }
  }
};
