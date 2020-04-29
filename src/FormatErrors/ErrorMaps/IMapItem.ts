export interface IData {
  errorType: string;
}

export interface IMapItem {
  message: string;
  data: (error: Error) => IData;
}

export interface IErrorMap {
  [key: string]: IMapItem;
}
