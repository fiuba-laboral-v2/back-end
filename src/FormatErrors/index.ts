import { ApolloErrorConverter } from "apollo-error-converter";
import { ErrorMap } from "./ErrorMaps";
import { generic } from "./ErrorMaps/Generic";

export const apolloErrorConverter = (
  { logger }: { logger?: boolean } = { logger: true }
) => new ApolloErrorConverter({ errorMap: ErrorMap, fallback: generic, logger });
