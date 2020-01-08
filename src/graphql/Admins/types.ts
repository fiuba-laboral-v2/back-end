"use strict";

const Admin =`
  type Admin {
    id: ID
    name: String!
    surname: String!
    age: Int
  }

  extend type Query {
    getAdminById(id: ID): Admin
  }
`;

export = [Admin];
