import rootType from "./type";
import { GraphQLString } from "graphql";
import { Root, RootsRepository } from "../../models/roots";

const rootMutations = {
  saveRoot: {
    type: rootType,
    args: {
      title: {
        type: GraphQLString
      }
    },
    resolve: ({}, { title }: { title: string }) => {
      return RootsRepository.save(new Root({ title }));
    }
  }
};

export default rootMutations;
