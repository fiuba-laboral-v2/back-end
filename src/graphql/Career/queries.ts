import { GraphQLCareer } from "./Types/Career";
import { ID, List, nonNull } from "$graphql/fieldTypes";
import { CareerRepository } from "$models/Career";

export const careerQueries = {
  getCareerByCode: {
    type: GraphQLCareer,
    args: {
      code: {
        type: nonNull(ID)
      }
    },
    resolve: (_: undefined, { code }) => CareerRepository.findByCode(code)
  },
  getCareers: {
    type: List(GraphQLCareer),
    resolve: async () => await CareerRepository.findAll()
  }
};
