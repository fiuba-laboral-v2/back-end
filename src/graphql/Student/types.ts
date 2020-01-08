"use strict";

const Student =`
  type Student {
    id: ID
    name: String!
    surname: String!
    age: Int
  }

  extend type Query {
    getStudentById(id: ID): Student
  }
`;

export = [Student];
