import GraphQLCareer from "./Types";
import { Int, nonNull, String } from "../fieldTypes";

import {
  Career,
  ICareer,
  CareerRepository,
  CareerSerializer
} from "../../models/Career";

const careerMutations = {
  addCareer: {
    type: GraphQLCareer,
    args: {
      code: {
        type: nonNull(String)
      },
      description: {
        type: nonNull(String)
      },
      credits: {
        type: Int
      }
    },
    resolve: async (_: undefined, props: ICareer) => {
      const newCareer: Career = await CareerRepository.create(props);
      return CareerSerializer.serialize(newCareer);
    }
  }
};

export default careerMutations;
