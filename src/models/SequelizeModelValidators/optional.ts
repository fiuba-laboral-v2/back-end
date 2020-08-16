export const optional = <T>(validate: (attribute: T) => void) => ({
  validate: {
    optional: (attribute?: T) => attribute === undefined || validate(attribute)
  }
});
