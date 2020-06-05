import { CookieOptions, Response } from "express";
import { ExecutionParams } from "subscriptions-transport-ws";

export type TSetCookie = (name: string, val: string, options: CookieOptions) => void;

export interface IExpressContext {
  res: {
    cookie: TSetCookie
  };
  req?: Response;
  connection?: ExecutionParams;
}

export const expressContextMock = (): IExpressContext => ({
  res: {
    cookie: (name: string, val: string, options: CookieOptions) => val
  }
});
