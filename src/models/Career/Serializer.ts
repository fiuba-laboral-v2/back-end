import { Career } from "./index";

import pick from "lodash/pick";

const CareerSerializer = {
  serialize: (career: Career) => pick(career, ["code", "description", "credits"]),
  serializeCareers: (careers: Career[]) => {
    const serializedCareers = Array();
    for (const career of careers) {
      serializedCareers.push(CareerSerializer.serialize(career));
    }
    return serializedCareers;
  }
};

export { CareerSerializer };
