import { CareerModel } from "./index";

const CareerSerializer = {
  serialize: (carrer: CareerModel) => {
    return {
      code: carrer.code,
      description: carrer.description,
      credits: carrer.credits
    };
  }
};

export { CareerSerializer };
