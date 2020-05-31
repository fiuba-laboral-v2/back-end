import { ICareer, Career, CareerRepository } from "../../../src/models/Career";
import { careerGenerator } from "./careerGenerator";
import { CustomGenerator } from "../types";

export type TCareerGenerator = CustomGenerator<Promise<Career>>;
export type TCareerDataGenerator = CustomGenerator<ICareer>;

export const CareerGenerator = {
  instance: (): TCareerGenerator => (
    careerGenerator<Promise<Career>>(
      (index: number) => CareerRepository.create({
        code: `${index}`,
        description: `description${index}`,
        credits: 100
      })
    )
  ),
  data: (): TCareerDataGenerator => {
    return careerGenerator<ICareer>(
      (index: number) => ({
        code: `${index}`,
        description: `description${index}`,
        credits: 100
      })
    );
  }
};
