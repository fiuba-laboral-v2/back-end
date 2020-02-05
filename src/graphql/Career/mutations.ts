import CareerTypes from "./types";
import { Int, nonNull, String } from "../fieldTypes";

import {
  CareerModel,
  ICareer,
  CareerRepository,
  CareerSerializer
} from "../../models/Career";

const [ GCareer ] = CareerTypes;

const careerMutations = {
  addCareer: {
    type: GCareer,
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
      const newCareer: CareerModel = await CareerRepository.create(props);
      return CareerSerializer.serialize(newCareer);
    }
  }
};

export default careerMutations;
