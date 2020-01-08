"use strict";

const Root =`
  type Root {
    id: ID
    title: String!
  }

  extend type Query {
    getRootById(id: ID): Root
  }

  extend type Mutation {
    saveRoot(title: String!): Root
  }
`;

export = [Root];
