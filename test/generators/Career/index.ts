import { ICareer, Career, CareerRepository } from "../../../src/models/Career";
import { CustomGenerator } from "../types";

export type TCareerGenerator = CustomGenerator<Promise<Career>>;
export type TCareerDataGenerator = CustomGenerator<ICareer>;

export const CareerGenerator = {
  instance: function*(): TCareerGenerator {
    let index = 0;
    while (true) {
      yield CareerRepository.create({
        code: `${index}`,
        description: `description${index}`,
        credits: 100
      });
      index++;
    }
  },
  data: function*(): TCareerDataGenerator {
    let index = 0;
    while (true) {
      yield {
        code: `${index}`,
        description: `description${index}`,
        credits: 100
      };
      index++;
    }
  }
};
