import { UserInputError } from "apollo-server";

import CareerTypes from "./types";
import { ID, nonNull } from "../fieldTypes";
import {
  CareerModel,
  CareerRepository,
  CareerSerializer
} from "../../models/Career";

const [ GCareer ] = CareerTypes;

const careerQueries = {
  getCareerByCode: {
    type: GCareer,
    args: {
      code: {
        type: nonNull(ID)
      }
    },
    resolve: async (_: undefined, { code }) => {
      try {
        const career: CareerModel | null = await CareerRepository.findByCode(code);

        return career && CareerSerializer.serialize(career);
      } catch {
        throw new UserInputError("Career Not found", { invalidArgs: Object.keys(code) });
      }
    }
  }
};

export default careerQueries;
