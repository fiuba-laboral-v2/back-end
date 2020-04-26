import { ApolloErrorConverter } from "apollo-error-converter";
import { errorMap } from "./ErrorMaps";
import { fallback } from "./fallback";

export const apolloErrorConverter = (
  { logger }: { logger?: boolean } = { logger: true }
) => new ApolloErrorConverter({ errorMap, fallback, logger });
