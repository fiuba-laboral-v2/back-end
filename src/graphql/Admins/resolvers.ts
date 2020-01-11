"use strict";

import property from "lodash/property";

const mockAdmin = [{
  id: "001",
  name: "Bruno",
  surname: "Diaz",
  age: 30
}];

export = {
  Admin: {
    id: property("id"),
    name: property("name"),
    surname: property("surname"),
    age: property("id")
  },
  Query: {
    getAdminById: (id: string) => {
      return mockAdmin[0];
    }
  }
};
