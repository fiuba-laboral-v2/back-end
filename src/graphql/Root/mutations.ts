import rootType from "./type";
import { String } from "../field_types";
import { Root, RootsRepository } from "../../models/roots";

const rootMutations = {
  saveRoot: {
    type: rootType,
    args: {
      title: {
        type: String
      }
    },
    resolve: (_: undefined, { title }: { title: string }) => {
      return RootsRepository.save(new Root({ title }));
    }
  }
};

export default rootMutations;
