import rootType from "./type";
import { String } from "../fieldTypes";
import { Root, RootsRepository } from "../../models/Root";

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
