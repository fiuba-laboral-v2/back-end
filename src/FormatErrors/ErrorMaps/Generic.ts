import { IMapItem } from "./IMapItem";

export const generic: IMapItem = {
  message: "Something has gone horribly wrong",
  data: (error: Error) => ({
    errorType: error.constructor.name
  })
};
