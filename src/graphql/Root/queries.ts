import rootType from "./type";
import { ID, nonNull } from "../field_types";
import { RootsRepository } from "../../models/roots";

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
