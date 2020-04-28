import { ApolloErrorConverter } from "apollo-error-converter";
import { errorMap } from "./ErrorMaps";
import { generic } from "./ErrorMaps/Generic";

export const apolloErrorConverter = (
  { logger }: { logger?: boolean } = { logger: true }
) => new ApolloErrorConverter({ errorMap, fallback: generic, logger });
