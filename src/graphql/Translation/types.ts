"use strict";

const Translation =`
  type Translation {
    translation: String!
  }

  extend type Query {
    getTranslationByPath(path: String!): Translation
  }
`;

export = [Translation];
