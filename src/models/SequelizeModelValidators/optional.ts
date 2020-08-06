export const optional = <T>(validate: (attribute: T) => void) => ({
  validate: {
    isOptional: (attribute?: T) => attribute === undefined || validate(attribute)
  }
});
