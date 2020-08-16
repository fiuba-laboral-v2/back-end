import { GraphQLCareer } from "../Types/GraphQLCareer";
import { nonNull, String, ID } from "$graphql/fieldTypes";
import { ICareer, CareerRepository } from "$models/Career";

export const saveCareer = {
  type: GraphQLCareer,
  args: {
    code: {
      type: nonNull(ID)
    },
    description: {
      type: nonNull(String)
    }
  },
  resolve: (_: undefined, props: ICareer) => CareerRepository.create(props)
};
