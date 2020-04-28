import { IMapItem } from "./index";

export const generic: IMapItem = {
  message: "Something has gone horribly wrong",
  data: (error: Error) => ({
    errorType: error.constructor.name
  })
};
