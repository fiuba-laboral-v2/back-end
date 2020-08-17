import { GraphQLCareer } from "../Types/GraphQLCareer";
import { List } from "$graphql/fieldTypes";
import { CareerRepository } from "$models/Career";

export const getCareers = {
  type: List(GraphQLCareer),
  resolve: () => CareerRepository.findAll()
};
