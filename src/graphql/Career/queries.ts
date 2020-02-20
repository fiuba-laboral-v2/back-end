import { UserInputError } from "apollo-server";

import { GraphQLCareer } from "./Types/Career";
import { ID, nonNull } from "../fieldTypes";
import {
  CareerRepository,
  CareerSerializer
} from "../../models/Career";

const careerQueries = {
  getCareerByCode: {
    type: GraphQLCareer,
    args: {
      code: {
        type: nonNull(ID)
      }
    },
    resolve: async (_: undefined, { code }) => {
      try {
        const career = await CareerRepository.findByCode([code]);

        return CareerSerializer.serialize(career[0]);
      } catch {
        throw new UserInputError("Career Not found", { invalidArgs: Object.keys(code) });
      }
    }
  }
};

export default careerQueries;
