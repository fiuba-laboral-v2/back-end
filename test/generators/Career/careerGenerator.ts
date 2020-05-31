import { CustomGenerator } from "../types";

export const careerGenerator = function*<T>(mapper: (index: number) => T): CustomGenerator<T> {
  let index = 0;
  while (true) {
    yield mapper(index);
    index++;
  }
};
