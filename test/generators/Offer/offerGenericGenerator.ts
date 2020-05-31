import { TCustomOfferGenerator } from "./index";

export const offerGenericGenerator = function*<TData, TVariables>(
  mapper: (index: number, variables: TVariables) => TData
): TCustomOfferGenerator<TData, TVariables> {
  let index = 0;
  let response: TVariables = yield {} as TData;
  while (true) {
    response = yield mapper(index, response);
    index++;
  }
};
