import { GraphQLCareer } from "./Types/Career";
import { List, ID, nonNull } from "../fieldTypes";
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
      const career = await CareerRepository.findByCode(code);
      return CareerSerializer.serialize(career);
    }
  },
  getCareers: {
    type: List(GraphQLCareer),
    resolve: async (_: undefined, __) => {
      const careers = await CareerRepository.findAll();
      return CareerSerializer.serializeCareers(careers);
    }
  }
};

export default careerQueries;
