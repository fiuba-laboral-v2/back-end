import { orderBy, isEqual } from "lodash";

export const toBeSortedBy = (received, { key, order = "desc" }: IOptions) => {
  const orderedArray = orderBy(received, key, order);
  if (isEqual(received, orderedArray)) return buildResponse({ key, pass: true, received, order });
  return buildResponse({ key, pass: false, received, order });
};

const buildResponse = ({ received, pass, key, order }: TBuildResponse) => {
  const negation = pass ? "not " : "";
  return {
    pass: pass,
    message: () => `Expected ${received} to ${negation} be sorted by ${key} in ${order} order`
  };
};

type TBuildResponse = {
  received: any;
  pass: boolean;
} & IOptions;

export interface IOptions {
  key: string;
  order?: "asc" | "desc";
}
