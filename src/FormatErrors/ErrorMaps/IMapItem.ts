export interface IData<T> {
  errorType: string;
  parameters?: T;
}

export interface IMapItem<T = {}> {
  message: string;
  data: (error: Error) => IData<T>;
}
