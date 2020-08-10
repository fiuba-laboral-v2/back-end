import { CareerRepository } from "$models/Career";
import { careerData } from "./careerData";

export const CareerGenerator = {
  index: 0,
  getIndex: () => {
    CareerGenerator.index += 1;
    return CareerGenerator.index;
  },
  instance: () => CareerRepository.create(careerData(CareerGenerator.getIndex())),
  data: () => careerData(CareerGenerator.getIndex())
};
