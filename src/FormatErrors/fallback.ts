import { IMapItem } from "./ErrorMaps";

export const fallback: IMapItem = {
  message: "Something has gone horribly wrong",
  data: (error: Error) => ({
    errorType: error.constructor.name
  })
};
