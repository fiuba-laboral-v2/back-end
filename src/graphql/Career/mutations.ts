import { GraphQLCareer } from "./Types/Career";
import { nonNull, String, ID } from "$graphql/fieldTypes";
import {
  ICareer,
  CareerRepository,
  CareerSerializer
} from "$models/Career";

const careerMutations = {
  saveCareer: {
    type: GraphQLCareer,
    args: {
      code: {
        type: nonNull(ID)
      },
      description: {
        type: nonNull(String)
      }
    },
    resolve: async (_: undefined, props: ICareer) => {
      const newCareer = await CareerRepository.create(props);
      return CareerSerializer.serialize(newCareer);
    }
  }
};

export default careerMutations;
