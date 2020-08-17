import { GraphQLCareer } from "../Types/GraphQLCareer";
import { ID, nonNull } from "$graphql/fieldTypes";
import { CareerRepository } from "$models/Career";

export const getCareerByCode = {
  type: GraphQLCareer,
  args: {
    code: {
      type: nonNull(ID)
    }
  },
  resolve: (_: undefined, { code }) => CareerRepository.findByCode(code)
};
