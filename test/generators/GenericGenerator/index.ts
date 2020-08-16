export type TGenericGenerator<TData, TVariables> = Generator<TData, TData, TVariables>;

export const GenericGenerator = function* <TData, TVariables>(
  mapper: (index: number, variables: TVariables) => TData
): TGenericGenerator<TData, TVariables> {
  let index = 0;
  let response: TVariables = yield {} as TData;
  while (true) {
    response = yield mapper(index, response);
    index++;
  }
};
