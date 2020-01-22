import rootType from "./type";
import { ID, nonNull } from "../fieldTypes";
import { RootsRepository } from "../../models/Root";

const rootQueries = {
  getRootById: {
    type: rootType,
    args: {
      id: {
        type: nonNull(ID)
      }
    },
    resolve: (_: undefined, { id }: { id: string }) => {
      return RootsRepository.findById(id);
    }
  }
};

export default rootQueries;
