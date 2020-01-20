import rootType from "./type";
import { GraphQLID, GraphQLNonNull } from "graphql";
import { RootsRepository } from "../../models/roots";

const rootQueries = {
  getRootById: {
    type: rootType,
    args: {
      id: {
        type: GraphQLNonNull(GraphQLID)
      }
    },
    resolve: ({}, { id }: { id: string }) => {
      return RootsRepository.findById(id);
    }
  }
};

export default rootQueries;
