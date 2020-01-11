"use strict";

import property from "lodash/property";
import { Root, RootsRepository } from "../../models/roots";

export = {
  Root: {
    id: property("id"),
    title: property("title")
  },
  Query: {
    getRootById: (id: string) => {
      return RootsRepository.findById(id);
    }
  },
  Mutation: {
    saveRoot: (title: string) => {
      return RootsRepository.save(new Root({ title }));
    }
  }
};
