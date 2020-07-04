import { rule as shieldRule } from "graphql-shield";
import { IRuleFunction } from "graphql-shield/dist/types";

export const rule = (ruleFunction: IRuleFunction) =>
  shieldRule({ cache: "contextual" })(ruleFunction);
