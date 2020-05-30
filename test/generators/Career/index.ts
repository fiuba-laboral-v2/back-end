import { Career, CareerRepository } from "../../../src/models/Career";
import { CustomGenerator } from "../types";

export type TCareerGenerator = CustomGenerator<Promise<Career>>;

export const CareerGenerator = function*(): TCareerGenerator {
  let index = 0;
  while (true) {
    yield CareerRepository.create({
      code: `${index}`,
      description: `description${index}`,
      credits: 100
    });
    index++;
  }
};
