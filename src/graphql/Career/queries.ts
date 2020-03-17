import { GraphQLCareer } from "./Types/Career";
import { ID, List, nonNull } from "../fieldTypes";
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
    resolve: async (_: undefined, { code }) => {
      const careers = await CareerRepository.findAll();
      return careers.map(career => CareerSerializer.serialize(career));
    }
  }
};

export default careerQueries;
