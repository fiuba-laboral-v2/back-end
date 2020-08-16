import { Career } from "$models";

import pick from "lodash/pick";

const CareerSerializer = {
  serialize: (career: Career) => pick(career, ["code", "description", "credits"])
};

export { CareerSerializer };
